// The MIT License (MIT)
// Copyright © 2018 Andreas Mehlsen andmehlsen@gmail.com
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE
//
// Github: https://github.com/andreasbm/focus-trap

const timeouts = new Map<string, number>();

/**
 * Debounces a callback.
 * @param cb
 * @param ms
 * @param id
 */
export function debounce(cb: () => void, ms: number, id: string) {
  // Clear current timeout for id
  const timeout = timeouts.get(id);
  if (timeout != null) {
    window.clearTimeout(timeout);
  }

  // Set new timeout
  timeouts.set(
    id,
    window.setTimeout(() => {
      cb();
      timeouts.delete(id);
    }, ms)
  );
}
