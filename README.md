# timer-interval-read

Push data from Iterable by a specific timer interval by time unit of second, millisecond or frame.

## usage

install from github.

```zsh
npm install -D rosiirao/timer-interval-read#alpha
```

import module and use it.

```typescript
import {readByTimer, ReadOptions} from 'timer-interval-read';
function readByTimer<T>(
  iterable: Iterable<T>,
  consume: (t: T) => void,
  options: ReadOptions
);
```
