from contextlib import AbstractContextManager, contextmanager
from typing import Callable, Iterator

SpanFactory = Callable[[str], AbstractContextManager[None]]


@contextmanager
def noop_span(_name: str) -> Iterator[None]:
    yield
