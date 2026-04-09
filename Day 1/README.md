## Reflection on TDD approach

TDD is less about tests and more about design feedback.

In short, write a tiny failing test, make it pass with the simplest code, then refactor. That loop keeps scope small, reduces overengineering, and gives confidence to change code later. The trade off is speed at the start, it can and does feel slower but it usually pays back with fewer bugs and cleaner architecture.

It also forces you to think from the outside in how the code should be used, before deciding how it’s implemented. That tends to produce simpler interfaces and better separation of concerns. When a test feels hard to write, it’s often a signal that the design itself is too complex.