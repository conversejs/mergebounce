import isObject from 'lodash-es/isObject.js';
import merge from 'lodash-es/merge.js';
import mergeWith from 'lodash-es/mergeWith.js';
import now from 'lodash-es/now.js';
import toNumber from 'lodash-es/toNumber.js';
import { getOpenPromise } from '@converse/openpromise/openpromise.js';

/** Error message constants. */
const FUNC_ERROR_TEXT = 'Expected a function';

/* Built-in method references for those with the same name as other `lodash` methods. */
const nativeMax = Math.max;
const nativeMin = Math.min;

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 *
 * This function differs from lodash's debounce by merging all passed objects
 * before passing them to the final invoked function.
 *
 * Because of this, invoking can only happen on the trailing edge, since
 * passed-in data would be discarded if invoking happened on the leading edge.
 *
 * If `wait` is `0`, `func` invocation is deferred until to the next tick,
 * similar to `setTimeout` with a timeout of `0`.
 *
 * @static
 * @category Function
 * @param {Function} func The function to mergebounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.concatArrays=false]
 *  By default arrays will be treated as objects when being merged. When
 *  merging two arrays, the values in the 2nd arrray will replace the
 *  corresponding values (i.e. those with the same indexes) in the first array.
 *  When `concatArrays` is set to `true`, arrays will be concatenated instead.
 * @param {boolean} [options.dedupeArrays=false]
 *  This option is similar to `concatArrays`, except that the concatenated
 *  array will also be deduplicated. Thus any entries that are concatenated to the
 *  existing array, which are already contained in the existing array, will
 *  first be removed.
 * @param {boolean} [options.promise=false]
 *  By default, when calling a merge-debounced function that doesn't execute
 *  immediately, you'll receive the result from its previous execution, or
 *  `undefined` if it has never executed before. By setting the `promise`
 *  option to `true`, a promise will be returned instead of the previous
 *  execution result when the function is debounced. The promise will resolve
 *  with the result of the next execution, as soon as it happens.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * window.addEventListener('resize', mergebounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * element.addEventListner('click', mergebounce(sendMail, 300));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * const mergebounced = mergebounce(batchLog, 250, { 'maxWait': 1000 });
 * const source = new EventSource('/stream');
 * jQuery(source).on('message', mergebounced);
 *
 * // Cancel the trailing debounced invocation.
 * window.addEventListener('popstate', mergebounced.cancel);
 */
function mergebounce(func, wait, options={}) {
  let lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      maxing = false;

  let promise = options.promise ? getOpenPromise() : null;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
  }

  function invokeFunc(time) {
    const args = lastArgs;
    const thisArg = lastThis;
    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    if (options.promise) {
      promise.resolve(result);
      promise = getOpenPromise();
    }
    return options.promise ? promise : result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    return options.promise ? promise : result;
  }

  function remainingWait(time) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastCall;
    return maxing
      ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }

  function shouldInvoke(time) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    const time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return options.promise ? promise : result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function concatArrays(objValue, srcValue) {
    if (Array.isArray(objValue) && Array.isArray(srcValue)) {
      if (options?.dedupeArrays) {
        return objValue.concat(srcValue.filter(i => objValue.indexOf(i) === -1));
      } else {
        return objValue.concat(srcValue);
      }
    }
  }

  function mergeArguments(args) {
    if (lastArgs?.length) {
      if (!args.length) {
        return lastArgs;
      }
      if (options?.concatArrays || options?.dedupeArrays) {
        return mergeWith(lastArgs, args, concatArrays);
      } else {
        return merge(lastArgs, args);
      }
    } else {
      return args || [];
    }
  }

  function debounced() {
    const time = now();
    const isInvoking = shouldInvoke(time);

    lastArgs = mergeArguments(Array.from(arguments));
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        clearTimeout(timerId);
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return options.promise ? promise : result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

export default mergebounce;
