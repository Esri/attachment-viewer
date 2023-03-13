// The MIT License (MIT)
// Copyright © 2018 Andreas Mehlsen andmehlsen@gmail.com
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE
//
// Github: https://github.com/andreasbm/focus-trap

/**
 * Returns whether the element is hidden.
 * @param $elem
 */
export function isHidden($elem: HTMLElement): boolean {
  return (
    $elem.hasAttribute("hidden") ||
    ($elem.hasAttribute("aria-hidden") && $elem.getAttribute("aria-hidden") !== "false") ||
    // A quick and dirty way to check whether the element is hidden.
    // For a more fine-grained check we could use "window.getComputedStyle" but we don't because of bad performance.
    // If the element has visibility set to "hidden" or "collapse", display set to "none" or opacity set to "0" through CSS
    // we won't be able to catch it here. We accept it due to the huge performance benefits.
    $elem.style.display === `none` ||
    $elem.style.opacity === `0` ||
    $elem.style.visibility === `hidden` ||
    $elem.style.visibility === `collapse`
  );

  // If offsetParent is null we can assume that the element is hidden
  // https://stackoverflow.com/questions/306305/what-would-make-offsetparent-null
  //|| $elem.offsetParent == null;
}

/**
 * Returns whether the element is disabled.
 * @param $elem
 */
export function isDisabled($elem: HTMLElement): boolean {
  return (
    $elem.hasAttribute("disabled") ||
    ($elem.hasAttribute("aria-disabled") && $elem.getAttribute("aria-disabled") !== "false")
  );
}

/**
 * Determines whether an element is focusable.
 * Read more here: https://stackoverflow.com/questions/1599660/which-html-elements-can-receive-focus/1600194#1600194
 * Or here: https://stackoverflow.com/questions/18261595/how-to-check-if-a-dom-element-is-focusable
 * @param $elem
 */
export function isFocusable($elem: HTMLElement): boolean {
  // Discard elements that are removed from the tab order.
  if ($elem.getAttribute("tabindex") === "-1" || isHidden($elem) || isDisabled($elem)) {
    return false;
  }

  return (
    // At this point we know that the element can have focus (eg. won't be -1) if the tabindex attribute exists
    $elem.hasAttribute("tabindex") ||
    // Anchor tags or area tags with a href set
    (($elem instanceof HTMLAnchorElement || $elem instanceof HTMLAreaElement) && $elem.hasAttribute("href")) ||
    // Form elements which are not disabled
    $elem instanceof HTMLButtonElement ||
    $elem instanceof HTMLInputElement ||
    $elem instanceof HTMLTextAreaElement ||
    $elem instanceof HTMLSelectElement ||
    // IFrames
    $elem instanceof HTMLIFrameElement
  );
}
