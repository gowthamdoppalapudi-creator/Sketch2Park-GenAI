import io
import os
import uuid
from pathlib import Path
from typing import Tuple
import cv2
import numpy as np
from PIL import Image, ImageOps
from fastapi import HTTPException, UploadFile, status

from app.config import settings

def validate_and_process_upload(file_bytes: bytes, original_filename: str) -> Tuple[Image.Image, int, int]:
    """
    Validates actual image file contents, checks size and dimension limits,
    corrects EXIF orientation, and returns an RGB PIL Image.
    """
    # 1. Check file size
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(file_bytes) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    # 2. Check extension
    ext = original_filename.split(".")[-1].lower() if "." in original_filename else ""
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '.{ext}'. Allowed formats: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )

    # 3. Validate image content with Pillow
    try:
        raw_img = Image.open(io.BytesIO(file_bytes))
        raw_img.verify()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid image file or corrupted content: {str(e)}"
        )

    # Re-open image after verify() closes the stream
    img = Image.open(io.BytesIO(file_bytes))

    # 4. Correct EXIF orientation (common in phone photos of sketches)
    try:
        img = ImageOps.exif_transpose(img)
    except Exception:
        pass

    # Convert to RGB
    img = img.convert("RGB")

    width, height = img.size

    # 5. Dimension checks
    if width < settings.MIN_IMAGE_DIMENSION or height < settings.MIN_IMAGE_DIMENSION:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Image dimensions ({width}x{height}) are smaller than minimum allowed {settings.MIN_IMAGE_DIMENSION}x{settings.MIN_IMAGE_DIMENSION}."
        )
    if width > settings.MAX_IMAGE_DIMENSION or height > settings.MAX_IMAGE_DIMENSION:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Image dimensions ({width}x{height}) exceed maximum allowed {settings.MAX_IMAGE_DIMENSION}x{settings.MAX_IMAGE_DIMENSION}."
        )

    return img, width, height

def resize_and_pad(img: Image.Image, target_size: int = 512) -> Image.Image:
    """
    Resizes image maintaining original aspect ratio and pads with black background
    to achieve exact target_size x target_size.
    """
    w, h = img.size
    scale = target_size / max(w, h)
    new_w = max(1, int(w * scale))
    new_h = max(1, int(h * scale))

    resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    padded = Image.new("RGB", (target_size, target_size), (255, 255, 255))
    paste_x = (target_size - new_w) // 2
    paste_y = (target_size - new_h) // 2
    padded.paste(resized, (paste_x, paste_y))
    return padded

def extract_canny_edges(
    img: Image.Image,
    low_threshold: int = 100,
    high_threshold: int = 200,
    target_size: int = 512
) -> Image.Image:
    """
    Applies OpenCV Canny edge extraction.
    Pads to target_size x target_size and returns a 3-channel RGB PIL Image
    suitable for Hugging Face ControlNet Canny models (white edges on black background).
    """
    standardized = resize_and_pad(img, target_size)
    np_img = np.array(standardized)

    # Convert RGB to grayscale
    gray = cv2.cvtColor(np_img, cv2.COLOR_RGB2GRAY)

    # Slightly blur to reduce paper grain / phone camera noise
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)

    # Invert if sketch has dark lines on light background (standard drawing)
    # Canny operates on gradients, but for thresholding clean edges:
    edges = cv2.Canny(blurred, low_threshold, high_threshold)

    # ControlNet Canny expects 3-channel image (H, W, 3) with edges as 255
    edges_3channel = np.stack([edges] * 3, axis=-1)
    return Image.fromarray(edges_3channel)

def save_sketch_and_conditioning(
    img: Image.Image,
    original_filename: str,
    low_threshold: int = 100,
    high_threshold: int = 200
) -> Tuple[str, str, str, str]:
    """
    Saves the original uploaded sketch and its initial conditioning Canny edge map.
    Returns: (stored_sketch_filename, sketch_path, stored_cond_filename, cond_path)
    """
    file_id = uuid.uuid4().hex[:12]
    ext = original_filename.split(".")[-1].lower() if "." in original_filename else "png"
    if ext not in ["jpg", "jpeg", "png"]:
        ext = "png"

    sketch_filename = f"sketch_{file_id}.{ext}"
    cond_filename = f"canny_{file_id}.png"

    sketch_path = settings.SKETCHES_DIR / sketch_filename
    cond_path = settings.CONDITIONING_DIR / cond_filename

    # Save original sketch
    img.save(sketch_path, quality=95)

    # Extract Canny edge map and save
    cond_img = extract_canny_edges(img, low_threshold, high_threshold, settings.TARGET_IMAGE_SIZE)
    cond_img.save(cond_path, format="PNG")

    return (
        sketch_filename,
        str(sketch_path),
        cond_filename,
        str(cond_path),
    )

def recalculate_conditioning(
    sketch_path: str,
    low_threshold: int,
    high_threshold: int
) -> Tuple[str, str]:
    """
    Recalculates Canny edges with modified sensitivity thresholds for preview.
    Returns: (new_cond_filename, new_cond_path)
    """
    if not os.path.exists(sketch_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Original sketch file not found on disk."
        )

    img = Image.open(sketch_path).convert("RGB")
    file_id = uuid.uuid4().hex[:12]
    cond_filename = f"canny_preview_{file_id}.png"
    cond_path = settings.CONDITIONING_DIR / cond_filename

    cond_img = extract_canny_edges(img, low_threshold, high_threshold, settings.TARGET_IMAGE_SIZE)
    cond_img.save(cond_path, format="PNG")

    return cond_filename, str(cond_path)
