/* eslint-disable @typescript-eslint/ban-ts-comment */
import MD5 from "md5-es";
import { logReport } from "@/config";
import { isString, isObject } from "@/utils/isType";
import { windowOrs } from "@/store";
// 参考文档: https://weikezhijia.feishu.cn/docx/IGqPdDWmSomyvsxKd2CcyVSjnrn

//ors_id三对
let ors_id_ps: null | string = null; // 相同场景下的父级orsId
let ors_id: null | string = null; // 相同场景下的当前的orsId
let ors_id_pg: null | string = null; // 全局场景下的全局orsId

// 页面Id的三对
let ors_pid_ps: null | string = null; // 相同场景下来源页面的pid
let ors_cur_pid: null | string = null; // 相同场景下当前的pid
let ors_pid_pg: null | string = null; // 全局场景下的全局的pid

// 场景的Id
let ors_scenes_pg: null | string = null; // 上一个节点场景
let ors_cur_scenes: null | string = null; // 当前的scense
// 场景的value值由service_data_name代替

// 场景map值
const scenesMap = {};

// 当前的值
const localSaveId = {
  curOrsId: "",
  curOrsPid: "",
};
// md5生成orsId
const getOrsId = (params: any): object => {
  try {
    const { p_id, m_id, t_id, s_id, e_id, event } = params;
    // orsId的替换
    ors_id_pg = ors_id;
    const orsCurId = MD5.hash(p_id + m_id + t_id + s_id + e_id + event);
    ors_id = orsCurId;
    localSaveId.curOrsId = ors_id as string;

    // pid的替换
    ors_pid_pg = ors_cur_pid;
    ors_cur_pid = p_id;
    localSaveId.curOrsPid = ors_cur_pid as string;

    // 与上个节点不同场景下
    if (ors_scenes_pg !== ors_cur_scenes) {
      // @ts-ignore
      if (scenesMap?.[ors_scenes_pg]?.curPId) {
        // @ts-ignore
        ors_id_ps = scenesMap?.[ors_scenes_pg]?.curOrsId;
        // @ts-ignore
        ors_pid_ps = scenesMap?.[ors_scenes_pg]?.curPId;
      }
    } else {
      if (ors_pid_pg) {
        // 与上个节点相同场景下
        ors_id_ps = ors_id_pg;
        ors_pid_ps = ors_pid_pg;
      }
    }
    // 如果ors_id_ps和ors_pid_ps为空的话,取缓存中的,针对页面刷新以及相同域名跨域名的场景
    if (!ors_id_ps && !ors_pid_ps && localStorage.getItem("_orsObserveId")) {
      const orsObId = JSON.parse(localStorage.getItem("_orsObserveId") || "{}");
      ors_id_ps = orsObId.curOrsId;
      ors_pid_ps = orsObId.curOrsPid;
    }

    localStorage.setItem("_orsObserveId", JSON.stringify(localSaveId));
    return {
      ors_id,
      // ors_pid_pg,
      // ors_id_pg,
      ors_id_ps,
      ors_pid_ps,
    };
  } catch (error) {
    logReport("getOrsId", error);
    return {};
  }
};

// 场景的Id,上一个节点场景(全局场景下)
const getScenesId = (params: any) => {
  try {
    ors_scenes_pg = ors_cur_scenes;
    // 获取场景的值
    const { service_data_name } = params;
    ors_cur_scenes = service_data_name;
    // 需要记录当前场景和错误以及错误的资源关系做关联
    if (ors_cur_scenes) {
      windowOrs.ubsData.scenes = ors_cur_scenes;
    }

    //@ts-ignore
    scenesMap[ors_cur_scenes] = {
      curOrsId: ors_id,
      curPId: ors_cur_pid,
    };
    return { ors_scenes_pg };
  } catch (error) {
    logReport("getScenesId", error);
    return null;
  }
};

const paramsValidator = (eventName: string, params: object) => {
  if (!isString(eventName) || !isObject(params)) return false;
  const requiredProps = ["p_id", "m_id", "t_id", "s_id", "e_id"];
  const hasAllProps = requiredProps.every((prop) => prop in params);
  if (!hasAllProps) return false;
  return true;
};

const getOrsIdMap = (eventName: string, params: Record<string, any>) => {
  try {
    if (!paramsValidator(eventName, params)) return params;
    // 可采集记录的事件名称
    const collectEventName = ["page_view", "element_click", "app_event_banner"];
    if (!collectEventName.includes(eventName)) return params;
    getScenesId(params);

    const orsIdAll: any = getOrsId(params);
    if (orsIdAll?.ors_id) params["ors_id"] = orsIdAll.ors_id;
    if (orsIdAll?.ors_id_ps) params["ors_id_ps"] = orsIdAll.ors_id_ps;
    if (orsIdAll?.ors_pid_ps) params["ors_pid_ps"] = orsIdAll.ors_pid_ps;

    return params;
  } catch (error) {
    logReport("addUbsOrsId", error);
    return params;
  }
};

export { getOrsIdMap };
