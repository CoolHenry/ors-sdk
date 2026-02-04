import { JsErrorInfoType } from '@/types/init';

import { parsePattern } from '@/utils';

import { logReport } from '@/config';

import { windowOrs } from '@/store';

import { SessionParams } from '@/types/init';

import { DEFAULT_IGNORE_ERRORS } from '@/constant';

const DISCARDED_MARK_KEY = '_isDiscarded';

/** 标识错误信息被废弃 */
export const markErrorAsDiscarded = (err: JsErrorInfoType) => {
  if (!err) {
    return;
  }
  (err as JsErrorInfoType & { _isDiscarded?: boolean })[DISCARDED_MARK_KEY] = true;
};

/** 判断当前错误信息是否被废弃 */
export const isErrorAsDiscarded = (err: JsErrorInfoType & { _isDiscarded?: boolean }) => {
  return err[DISCARDED_MARK_KEY] === true;
};

const getIgnoreErrorsList = (params: SessionParams) => {
  try {
    const initIgnoreErrorsList = params.ignoreErrors && Array.isArray(params.ignoreErrors) ? params.ignoreErrors : [];
    const errorBlackIgnoregList = windowOrs.samplingConfig.blJsErrMsg || [];
    const ignoreErrorsList = DEFAULT_IGNORE_ERRORS.concat(initIgnoreErrorsList).concat(errorBlackIgnoregList);
    return ignoreErrorsList;
  } catch (error) {
    logReport('getIgnoreErrorsList', error);
    return [];
  }
};

// 错误信息采样黑名单
export const needSkipError = (message: string, params?: SessionParams) => {
  try {
    // 错误信息采样黑名单
    const ignoreErrorsList = params ? getIgnoreErrorsList(params) : [];

    if (message && Array.isArray(ignoreErrorsList) && ignoreErrorsList?.length > 0) {
      // 然后过滤非字符串项并判断
      const errorBlackMsgListPattern = ignoreErrorsList.map(parsePattern);
      const blackSwitch = errorBlackMsgListPattern.some((pattern) => {
        if (pattern instanceof RegExp) {
          return pattern.test(message);
        } else if (typeof pattern === 'string') {
          return message.includes(pattern);
        } else {
          return false;
        }
      });
      return blackSwitch;
    } else {
      return false;
    }
  } catch (error) {
    logReport('needSkipError', error);
    return false;
  }
};
