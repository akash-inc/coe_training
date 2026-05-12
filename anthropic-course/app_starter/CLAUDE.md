# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Set up environment
uv venv && source .venv/bin/activate
uv pip install -e .

# Start the MCP server
uv run main.py

# Run all tests
uv run pytest

# Run a single test
uv run pytest tests/test_document.py::TestBinaryDocumentToMarkdown::test_binary_document_to_markdown_with_docx
```

## Architecture

This project is a **FastMCP server** (`main.py`) that exposes Python functions as MCP tools. The server is named `"docs"` and tools are registered via `mcp.tool()(function)`.

**Tool registration pattern** — define a plain function in `tools/`, then register it in `main.py`:

```python
from tools.math import add
mcp.tool()(add)
```

**Tool authoring conventions** — define the function in `tools/`, then register it in `main.py` with `mcp.tool()(fn)`. Use `pydantic.Field` for every parameter (required for MCP schema generation). Docstrings must follow this structure:

```python
from pydantic import Field

def my_tool(
    param1: str = Field(description="Detailed description of this parameter"),
    param2: int = Field(description="Explain what this parameter does"),
) -> ReturnType:
    """One-line summary.

    Detailed explanation of functionality.

    When to use:
    - Situation A
    - Situation B

    Examples:
    >>> my_tool("foo", 1)
    "result"
    """
```

Tool descriptions should explain when to use **and when not to use** the tool.

**Document conversion** (`tools/document.py`) — `binary_document_to_markdown(binary_data, file_type)` wraps `markitdown` to convert `.docx` and `.pdf` binary payloads to markdown. Test fixtures live in `tests/fixtures/`.

**Dependencies**: `mcp[cli]==1.8.0`, `markitdown[docx,pdf]`, `pydantic`, `pytest`. Managed with `uv` via `pyproject.toml`.
