# Document Tools

A Python package implementing a variety of document-related tools for converting and processing document formats. These tools are exposed through an MCP server interface for seamless integration with AI assistants.

## Setup

```bash
# Create a virtual env and activate it
uv venv
source .venv/bin/activate

# Install the package in development mode
uv pip install -e .
```

## Running

```bash
# Start the MCP server
uv run main.py
```

## MCP Server Setup in Claude Code

Register the `documents` server using the venv Python directly (not `uv run`):

```bash
claude mcp add documents -s local -- \
  /path/to/app_starter/.venv/bin/python \
  /path/to/app_starter/main.py
```

Replace `/path/to/app_starter` with the absolute path to this directory.

### Why not `uv run main.py`?

Two issues arise when using `uv run` as the MCP command:

1. **`uv` not on PATH** — Claude Code spawns MCP servers with a minimal environment that does not include `~/.local/bin`, so the `uv` binary cannot be found (ENOENT).
2. **`onnxruntime` incompatible with Python 3.14** — Even with a full path to `uv`, `uv run` re-resolves dependencies at startup and fails because `onnxruntime` (a `markitdown` dependency) only has wheels for Python ≤ 3.13.

Using the venv Python directly bypasses both problems: no PATH lookup needed and no dependency re-resolution.

## Testing

```bash
# Run all tests
uv run pytest
```

## Development

### Tool Definitions

Tools are defined as Python functions and registered with the MCP server:

```python
mcp.tool()(my_function)
```

Tool descriptions should:

- Begin with a one-line summary
- Provide detailed explanation of functionality
- Explain when to use (and not use) the tool
- Include usage examples with expected input/output

Use `Field` from pydantic for parameter descriptions:

```python
from pydantic import Field

def my_tool(
    param1: str = Field(description="Detailed description of this parameter"),
    param2: int = Field(description="Explain what this parameter does")
) -> ReturnType:
    """Comprehensive docstring here"""
    # Implementation
```
