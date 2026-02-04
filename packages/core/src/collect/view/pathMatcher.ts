export abstract class AbstractPathMatcher {
  /** 唯一key，通过设置这个属性防止重复注册 */
  key?: string | number;
  abstract matchPath: (pathname: string) => { pattern?: string; name?: string } | undefined;
}
