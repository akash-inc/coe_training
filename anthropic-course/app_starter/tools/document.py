from markitdown import MarkItDown, StreamInfo
from io import BytesIO
from pydantic import Field


def binary_document_to_markdown(binary_data: bytes, file_type: str) -> str:
    """Converts binary document data to markdown-formatted text."""
    md = MarkItDown()
    file_obj = BytesIO(binary_data)
    stream_info = StreamInfo(extension=file_type)
    result = md.convert(file_obj, stream_info=stream_info)
    return result.text_content


def document_path_to_markdown(
    path: str = Field(description="Absolute or relative path to a .pdf or .docx file"),
) -> str:
    """Convert a PDF or DOCX file at the given path to markdown.

    Reads the file from disk and returns its contents as a markdown-formatted string.

    When to use:
    - When you have a local file path and want its content as markdown
    - For processing PDF or DOCX documents stored on disk

    When not to use:
    - When you already have the file contents as bytes (use binary_document_to_markdown instead)
    - For file formats other than .pdf and .docx

    Examples:
    >>> document_path_to_markdown("/docs/report.pdf")
    "# Report Title\\n..."
    >>> document_path_to_markdown("/docs/notes.docx")
    "# Notes\\n..."
    """
    ext = path.rsplit(".", 1)[-1].lower() if "." in path else ""
    if ext not in ("pdf", "docx"):
        raise ValueError(f"Unsupported file type '.{ext}': must be .pdf or .docx")

    with open(path, "rb") as f:
        binary_data = f.read()

    return binary_document_to_markdown(binary_data, ext)
