/*! @sentry/browser 10.30.0 (540dbef) | https://github.com/getsentry/sentry-javascript */
var Sentry = (function (t) {
  t = window.Sentry || {};
  const n = globalThis,
    e = "10.30.0";
  function r() {
    return (o(n), n);
  }
  function o(t) {
    const n = (t.__SENTRY__ = t.__SENTRY__ || {});
    return ((n.version = n.version || e), (n[e] = n[e] || {}));
  }
  function i(t, r, o = n) {
    const i = (o.__SENTRY__ = o.__SENTRY__ || {}),
      s = (i[e] = i[e] || {});
    return s[t] || (s[t] = r());
  }
  const s = ["debug", "info", "warn", "error", "log", "assert", "trace"],
    c = {};
  function u(t) {
    if (!("console" in n)) return t();
    const e = n.console,
      r = {},
      o = Object.keys(c);
    o.forEach((t) => {
      const n = c[t];
      ((r[t] = e[t]), (e[t] = n));
    });
    try {
      return t();
    } finally {
      o.forEach((t) => {
        e[t] = r[t];
      });
    }
  }
  const a = "?",
    f = /\(error: (.*)\)/,
    l = /captureMessage|captureException/;
  function d(...t) {
    const n = t.sort((t, n) => t[0] - n[0]).map((t) => t[1]);
    return (t, e = 0, r = 0) => {
      const o = [],
        i = t.split("\n");
      for (let t = e; t < i.length; t++) {
        let e = i[t];
        e.length > 1024 && (e = e.slice(0, 1024));
        const s = f.test(e) ? e.replace(f, "$1") : e;
        if (!s.match(/\S*Error: /)) {
          for (const t of n) {
            const n = t(s);
            if (n) {
              o.push(n);
              break;
            }
          }
          if (o.length >= 50 + r) break;
        }
      }
      return (function (t) {
        if (!t.length) return [];
        const n = Array.from(t);
        /sentryWrapped/.test(h(n).function || "") && n.pop();
        (n.reverse(),
          l.test(h(n).function || "") &&
            (n.pop(), l.test(h(n).function || "") && n.pop()));
        return n
          .slice(0, 50)
          .map((t) => ({
            ...t,
            filename: t.filename || h(n).filename,
            function: t.function || a,
          }));
      })(o.slice(r));
    };
  }
  function h(t) {
    return t[t.length - 1] || {};
  }
  const p = "<anonymous>";
  function m(t) {
    try {
      return (t && "function" == typeof t && t.name) || p;
    } catch {
      return p;
    }
  }
  function y(t) {
    const n = t.exception;
    if (n) {
      const t = [];
      try {
        return (
          n.values.forEach((n) => {
            n.stacktrace.frames && t.push(...n.stacktrace.frames);
          }),
          t
        );
      } catch {
        return;
      }
    }
  }
  function g(t) {
    return "__v_isVNode" in t && t.__v_isVNode
      ? "[VueVNode]"
      : "[VueViewModel]";
  }
  const v = {},
    b = {};
  function _(t, n) {
    ((v[t] = v[t] || []), v[t].push(n));
  }
  function w(t, n) {
    if (!b[t]) {
      b[t] = !0;
      try {
        n();
      } catch (t) {}
    }
  }
  function E(t, n) {
    const e = t && v[t];
    if (e)
      for (const t of e)
        try {
          t(n);
        } catch (t) {}
  }
  let S = null;
  function $() {
    ((S = n.onerror),
      (n.onerror = function (t, n, e, r, o) {
        return (
          E("error", { column: r, error: o, line: e, msg: t, url: n }),
          !!S && S.apply(this, arguments)
        );
      }),
      (n.onerror.__SENTRY_INSTRUMENTED__ = !0));
  }
  let x = null;
  function k() {
    ((x = n.onunhandledrejection),
      (n.onunhandledrejection = function (t) {
        return (E("unhandledrejection", t), !x || x.apply(this, arguments));
      }),
      (n.onunhandledrejection.__SENTRY_INSTRUMENTED__ = !0));
  }
  const I = Object.prototype.toString;
  function j(t) {
    switch (I.call(t)) {
      case "[object Error]":
      case "[object Exception]":
      case "[object DOMException]":
      case "[object WebAssembly.Exception]":
        return !0;
      default:
        return D(t, Error);
    }
  }
  function T(t, n) {
    return I.call(t) === `[object ${n}]`;
  }
  function O(t) {
    return T(t, "ErrorEvent");
  }
  function R(t) {
    return T(t, "DOMError");
  }
  function C(t) {
    return T(t, "String");
  }
  function M(t) {
    return (
      "object" == typeof t &&
      null !== t &&
      "__sentry_template_string__" in t &&
      "__sentry_template_values__" in t
    );
  }
  function A(t) {
    return (
      null === t || M(t) || ("object" != typeof t && "function" != typeof t)
    );
  }
  function P(t) {
    return T(t, "Object");
  }
  function L(t) {
    return "undefined" != typeof Event && D(t, Event);
  }
  function N(t) {
    return Boolean(t?.then && "function" == typeof t.then);
  }
  function D(t, n) {
    try {
      return t instanceof n;
    } catch {
      return !1;
    }
  }
  function U(t) {
    return !(
      "object" != typeof t ||
      null === t ||
      !(t.__isVue || t.t || t.__v_isVNode)
    );
  }
  function B(t) {
    return "undefined" != typeof Request && D(t, Request);
  }
  const F = n;
  function q(t, n = {}) {
    if (!t) return "<unknown>";
    try {
      let e = t;
      const r = 5,
        o = [];
      let i = 0,
        s = 0;
      const c = " > ",
        u = c.length;
      let a;
      const f = Array.isArray(n) ? n : n.keyAttrs,
        l = (!Array.isArray(n) && n.maxStringLength) || 80;
      for (
        ;
        e &&
        i++ < r &&
        ((a = H(e, f)),
        !("html" === a || (i > 1 && s + o.length * u + a.length >= l)));
      )
        (o.push(a), (s += a.length), (e = e.parentNode));
      return o.reverse().join(c);
    } catch {
      return "<unknown>";
    }
  }
  function H(t, n) {
    const e = t,
      r = [];
    if (!e?.tagName) return "";
    if (F.HTMLElement && e instanceof HTMLElement && e.dataset) {
      if (e.dataset.sentryComponent) return e.dataset.sentryComponent;
      if (e.dataset.sentryElement) return e.dataset.sentryElement;
    }
    r.push(e.tagName.toLowerCase());
    const o = n?.length
      ? n.filter((t) => e.getAttribute(t)).map((t) => [t, e.getAttribute(t)])
      : null;
    if (o?.length)
      o.forEach((t) => {
        r.push(`[${t[0]}="${t[1]}"]`);
      });
    else {
      e.id && r.push(`#${e.id}`);
      const t = e.className;
      if (t && C(t)) {
        const n = t.split(/\s+/);
        for (const t of n) r.push(`.${t}`);
      }
    }
    const i = ["aria-label", "type", "name", "title", "alt"];
    for (const t of i) {
      const n = e.getAttribute(t);
      n && r.push(`[${t}="${n}"]`);
    }
    return r.join("");
  }
  function W() {
    try {
      return F.document.location.href;
    } catch {
      return "";
    }
  }
  function z(t, n, e) {
    if (!(n in t)) return;
    const r = t[n];
    if ("function" != typeof r) return;
    const o = e(r);
    "function" == typeof o && J(o, r);
    try {
      t[n] = o;
    } catch {}
  }
  function G(t, n, e) {
    try {
      Object.defineProperty(t, n, { value: e, writable: !0, configurable: !0 });
    } catch {}
  }
  function J(t, n) {
    try {
      const e = n.prototype || {};
      ((t.prototype = n.prototype = e), G(t, "__sentry_original__", n));
    } catch {}
  }
  function X(t) {
    return t.__sentry_original__;
  }
  function Y(t) {
    if (j(t))
      return { message: t.message, name: t.name, stack: t.stack, ...V(t) };
    if (L(t)) {
      const n = {
        type: t.type,
        target: K(t.target),
        currentTarget: K(t.currentTarget),
        ...V(t),
      };
      return (
        "undefined" != typeof CustomEvent &&
          D(t, CustomEvent) &&
          (n.detail = t.detail),
        n
      );
    }
    return t;
  }
  function K(t) {
    try {
      return (
        (n = t),
        "undefined" != typeof Element && D(n, Element)
          ? q(t)
          : Object.prototype.toString.call(t)
      );
    } catch {
      return "<unknown>";
    }
    var n;
  }
  function V(t) {
    if ("object" == typeof t && null !== t) {
      const n = {};
      for (const e in t)
        Object.prototype.hasOwnProperty.call(t, e) && (n[e] = t[e]);
      return n;
    }
    return {};
  }
  function Z(t, n = 0) {
    return "string" != typeof t || 0 === n || t.length <= n
      ? t
      : `${t.slice(0, n)}...`;
  }
  function Q(t, n) {
    if (!Array.isArray(t)) return "";
    const e = [];
    for (let n = 0; n < t.length; n++) {
      const r = t[n];
      try {
        U(r) ? e.push(g(r)) : e.push(String(r));
      } catch {
        e.push("[value cannot be serialized]");
      }
    }
    return e.join(n);
  }
  function tt(t, n, e = !1) {
    return (
      !!C(t) &&
      (T(n, "RegExp") ? n.test(t) : !!C(n) && (e ? t === n : t.includes(n)))
    );
  }
  function nt(t, n = [], e = !1) {
    return n.some((n) => tt(t, n, e));
  }
  let et;
  function rt(
    t = (function () {
      const t = n;
      return t.crypto || t.msCrypto;
    })(),
  ) {
    try {
      if (t?.randomUUID) return t.randomUUID().replace(/-/g, "");
    } catch {}
    return (
      et || (et = [1e7] + 1e3 + 4e3 + 8e3 + 1e11),
      et.replace(/[018]/g, (t) =>
        (t ^ (((16 * Math.random()) & 15) >> (t / 4))).toString(16),
      )
    );
  }
  function ot(t) {
    return t.exception?.values?.[0];
  }
  function it(t) {
    const { message: n, event_id: e } = t;
    if (n) return n;
    const r = ot(t);
    return r
      ? r.type && r.value
        ? `${r.type}: ${r.value}`
        : r.type || r.value || e || "<unknown>"
      : e || "<unknown>";
  }
  function st(t, n, e) {
    const r = (t.exception = t.exception || {}),
      o = (r.values = r.values || []),
      i = (o[0] = o[0] || {});
    (i.value || (i.value = n || ""), i.type || (i.type = "Error"));
  }
  function ct(t, n) {
    const e = ot(t);
    if (!e) return;
    const r = e.mechanism;
    if (
      ((e.mechanism = { type: "generic", handled: !0, ...r, ...n }),
      n && "data" in n)
    ) {
      const t = { ...r?.data, ...n.data };
      e.mechanism.data = t;
    }
  }
  function ut(t) {
    if (
      (function (t) {
        try {
          return t.__sentry_captured__;
        } catch {}
      })(t)
    )
      return !0;
    try {
      G(t, "__sentry_captured__", !0);
    } catch {}
    return !1;
  }
  function at() {
    return Date.now() / 1e3;
  }
  let ft;
  function lt() {
    return (
      ft ??
      (ft = (function () {
        const { performance: t } = n;
        if (!t?.now || !t.timeOrigin) return at;
        const e = t.timeOrigin;
        return () => (e + t.now()) / 1e3;
      })())
    )();
  }
  function dt(t) {
    const n = lt(),
      e = {
        sid: rt(),
        init: !0,
        timestamp: n,
        started: n,
        duration: 0,
        status: "ok",
        errors: 0,
        ignoreDuration: !1,
        toJSON: () =>
          (function (t) {
            return {
              sid: `${t.sid}`,
              init: t.init,
              started: new Date(1e3 * t.started).toISOString(),
              timestamp: new Date(1e3 * t.timestamp).toISOString(),
              status: t.status,
              errors: t.errors,
              did:
                "number" == typeof t.did || "string" == typeof t.did
                  ? `${t.did}`
                  : void 0,
              duration: t.duration,
              abnormal_mechanism: t.abnormal_mechanism,
              attrs: {
                release: t.release,
                environment: t.environment,
                ip_address: t.ipAddress,
                user_agent: t.userAgent,
              },
            };
          })(e),
      };
    return (t && ht(e, t), e);
  }
  function ht(t, n = {}) {
    if (
      (n.user &&
        (!t.ipAddress && n.user.ip_address && (t.ipAddress = n.user.ip_address),
        t.did ||
          n.did ||
          (t.did = n.user.id || n.user.email || n.user.username)),
      (t.timestamp = n.timestamp || lt()),
      n.abnormal_mechanism && (t.abnormal_mechanism = n.abnormal_mechanism),
      n.ignoreDuration && (t.ignoreDuration = n.ignoreDuration),
      n.sid && (t.sid = 32 === n.sid.length ? n.sid : rt()),
      void 0 !== n.init && (t.init = n.init),
      !t.did && n.did && (t.did = `${n.did}`),
      "number" == typeof n.started && (t.started = n.started),
      t.ignoreDuration)
    )
      t.duration = void 0;
    else if ("number" == typeof n.duration) t.duration = n.duration;
    else {
      const n = t.timestamp - t.started;
      t.duration = n >= 0 ? n : 0;
    }
    (n.release && (t.release = n.release),
      n.environment && (t.environment = n.environment),
      !t.ipAddress && n.ipAddress && (t.ipAddress = n.ipAddress),
      !t.userAgent && n.userAgent && (t.userAgent = n.userAgent),
      "number" == typeof n.errors && (t.errors = n.errors),
      n.status && (t.status = n.status));
  }
  function pt(t, n, e = 2) {
    if (!n || "object" != typeof n || e <= 0) return n;
    if (t && 0 === Object.keys(n).length) return t;
    const r = { ...t };
    for (const t in n)
      Object.prototype.hasOwnProperty.call(n, t) &&
        (r[t] = pt(r[t], n[t], e - 1));
    return r;
  }
  function mt() {
    return rt();
  }
  function yt() {
    return rt().substring(16);
  }
  const gt = "_sentrySpan";
  function vt(t, n) {
    n ? G(t, gt, n) : delete t[gt];
  }
  function bt(t) {
    return t[gt];
  }
  class _t {
    constructor() {
      ((this.o = !1),
        (this.i = []),
        (this.u = []),
        (this.l = []),
        (this.h = []),
        (this.p = {}),
        (this.m = {}),
        (this.v = {}),
        (this._ = {}),
        (this.S = {}),
        (this.k = {}),
        (this.I = { traceId: mt(), sampleRand: Math.random() }));
    }
    clone() {
      const t = new _t();
      return (
        (t.l = [...this.l]),
        (t.m = { ...this.m }),
        (t.v = { ...this.v }),
        (t._ = { ...this._ }),
        (t.S = { ...this.S }),
        this.S.flags && (t.S.flags = { values: [...this.S.flags.values] }),
        (t.p = this.p),
        (t.j = this.j),
        (t.T = this.T),
        (t.O = this.O),
        (t.R = this.R),
        (t.u = [...this.u]),
        (t.h = [...this.h]),
        (t.k = { ...this.k }),
        (t.I = { ...this.I }),
        (t.C = this.C),
        (t.M = this.M),
        vt(t, bt(this)),
        t
      );
    }
    setClient(t) {
      this.C = t;
    }
    setLastEventId(t) {
      this.M = t;
    }
    getClient() {
      return this.C;
    }
    lastEventId() {
      return this.M;
    }
    addScopeListener(t) {
      this.i.push(t);
    }
    addEventProcessor(t) {
      return (this.u.push(t), this);
    }
    setUser(t) {
      return (
        (this.p = t || {
          email: void 0,
          id: void 0,
          ip_address: void 0,
          username: void 0,
        }),
        this.T && ht(this.T, { user: t }),
        this.A(),
        this
      );
    }
    getUser() {
      return this.p;
    }
    setTags(t) {
      return ((this.m = { ...this.m, ...t }), this.A(), this);
    }
    setTag(t, n) {
      return this.setTags({ [t]: n });
    }
    setAttributes(t) {
      return ((this.v = { ...this.v, ...t }), this.A(), this);
    }
    setAttribute(t, n) {
      return this.setAttributes({ [t]: n });
    }
    removeAttribute(t) {
      return (t in this.v && (delete this.v[t], this.A()), this);
    }
    setExtras(t) {
      return ((this._ = { ...this._, ...t }), this.A(), this);
    }
    setExtra(t, n) {
      return ((this._ = { ...this._, [t]: n }), this.A(), this);
    }
    setFingerprint(t) {
      return ((this.R = t), this.A(), this);
    }
    setLevel(t) {
      return ((this.j = t), this.A(), this);
    }
    setTransactionName(t) {
      return ((this.O = t), this.A(), this);
    }
    setContext(t, n) {
      return (null === n ? delete this.S[t] : (this.S[t] = n), this.A(), this);
    }
    setSession(t) {
      return (t ? (this.T = t) : delete this.T, this.A(), this);
    }
    getSession() {
      return this.T;
    }
    update(t) {
      if (!t) return this;
      const n = "function" == typeof t ? t(this) : t,
        e = n instanceof _t ? n.getScopeData() : P(n) ? t : void 0,
        {
          tags: r,
          attributes: o,
          extra: i,
          user: s,
          contexts: c,
          level: u,
          fingerprint: a = [],
          propagationContext: f,
        } = e || {};
      return (
        (this.m = { ...this.m, ...r }),
        (this.v = { ...this.v, ...o }),
        (this._ = { ...this._, ...i }),
        (this.S = { ...this.S, ...c }),
        s && Object.keys(s).length && (this.p = s),
        u && (this.j = u),
        a.length && (this.R = a),
        f && (this.I = f),
        this
      );
    }
    clear() {
      return (
        (this.l = []),
        (this.m = {}),
        (this.v = {}),
        (this._ = {}),
        (this.p = {}),
        (this.S = {}),
        (this.j = void 0),
        (this.O = void 0),
        (this.R = void 0),
        (this.T = void 0),
        vt(this, void 0),
        (this.h = []),
        this.setPropagationContext({
          traceId: mt(),
          sampleRand: Math.random(),
        }),
        this.A(),
        this
      );
    }
    addBreadcrumb(t, n) {
      const e = "number" == typeof n ? n : 100;
      if (e <= 0) return this;
      const r = {
        timestamp: at(),
        ...t,
        message: t.message ? Z(t.message, 2048) : t.message,
      };
      return (
        this.l.push(r),
        this.l.length > e &&
          ((this.l = this.l.slice(-e)),
          this.C?.recordDroppedEvent("buffer_overflow", "log_item")),
        this.A(),
        this
      );
    }
    getLastBreadcrumb() {
      return this.l[this.l.length - 1];
    }
    clearBreadcrumbs() {
      return ((this.l = []), this.A(), this);
    }
    addAttachment(t) {
      return (this.h.push(t), this);
    }
    clearAttachments() {
      return ((this.h = []), this);
    }
    getScopeData() {
      return {
        breadcrumbs: this.l,
        attachments: this.h,
        contexts: this.S,
        tags: this.m,
        attributes: this.v,
        extra: this._,
        user: this.p,
        level: this.j,
        fingerprint: this.R || [],
        eventProcessors: this.u,
        propagationContext: this.I,
        sdkProcessingMetadata: this.k,
        transactionName: this.O,
        span: bt(this),
      };
    }
    setSDKProcessingMetadata(t) {
      return ((this.k = pt(this.k, t, 2)), this);
    }
    setPropagationContext(t) {
      return ((this.I = t), this);
    }
    getPropagationContext() {
      return this.I;
    }
    captureException(t, n) {
      const e = n?.event_id || rt();
      if (!this.C) return e;
      const r = new Error("Sentry syntheticException");
      return (
        this.C.captureException(
          t,
          { originalException: t, syntheticException: r, ...n, event_id: e },
          this,
        ),
        e
      );
    }
    captureMessage(t, n, e) {
      const r = e?.event_id || rt();
      if (!this.C) return r;
      const o = e?.syntheticException ?? new Error(t);
      return (
        this.C.captureMessage(
          t,
          n,
          { originalException: t, syntheticException: o, ...e, event_id: r },
          this,
        ),
        r
      );
    }
    captureEvent(t, n) {
      const e = n?.event_id || rt();
      return this.C
        ? (this.C.captureEvent(t, { ...n, event_id: e }, this), e)
        : e;
    }
    A() {
      this.o ||
        ((this.o = !0),
        this.i.forEach((t) => {
          t(this);
        }),
        (this.o = !1));
    }
  }
  class wt {
    constructor(t, n) {
      let e, r;
      ((e = t || new _t()),
        (r = n || new _t()),
        (this.P = [{ scope: e }]),
        (this.L = r));
    }
    withScope(t) {
      const n = this.N();
      let e;
      try {
        e = t(n);
      } catch (t) {
        throw (this.D(), t);
      }
      return N(e)
        ? e.then(
            (t) => (this.D(), t),
            (t) => {
              throw (this.D(), t);
            },
          )
        : (this.D(), e);
    }
    getClient() {
      return this.getStackTop().client;
    }
    getScope() {
      return this.getStackTop().scope;
    }
    getIsolationScope() {
      return this.L;
    }
    getStackTop() {
      return this.P[this.P.length - 1];
    }
    N() {
      const t = this.getScope().clone();
      return (this.P.push({ client: this.getClient(), scope: t }), t);
    }
    D() {
      return !(this.P.length <= 1) && !!this.P.pop();
    }
  }
  function Et() {
    const t = o(r());
    return (t.stack =
      t.stack ||
      new wt(
        i("defaultCurrentScope", () => new _t()),
        i("defaultIsolationScope", () => new _t()),
      ));
  }
  function St(t) {
    return Et().withScope(t);
  }
  function $t(t, n) {
    const e = Et();
    return e.withScope(() => ((e.getStackTop().scope = t), n(t)));
  }
  function xt(t) {
    return Et().withScope(() => t(Et().getIsolationScope()));
  }
  function kt(t) {
    const n = o(t);
    return n.acs
      ? n.acs
      : {
          withIsolationScope: xt,
          withScope: St,
          withSetScope: $t,
          withSetIsolationScope: (t, n) => xt(n),
          getCurrentScope: () => Et().getScope(),
          getIsolationScope: () => Et().getIsolationScope(),
        };
  }
  function It() {
    return kt(r()).getCurrentScope();
  }
  function jt() {
    return kt(r()).getIsolationScope();
  }
  function Tt() {
    return i("globalScope", () => new _t());
  }
  function Ot(...t) {
    const n = kt(r());
    if (2 === t.length) {
      const [e, r] = t;
      return e ? n.withSetScope(e, r) : n.withScope(r);
    }
    return n.withScope(t[0]);
  }
  function Rt() {
    return It().getClient();
  }
  function Ct(t) {
    const n = t.getPropagationContext(),
      { traceId: e, parentSpanId: r, propagationSpanId: o } = n,
      i = { trace_id: e, span_id: o || yt() };
    return (r && (i.parent_span_id = r), i);
  }
  const Mt = "sentry.source",
    At = "sentry.sample_rate",
    Pt = "sentry.op",
    Lt = "sentry.origin",
    Nt = "sentry.custom_span_name",
    Dt = "sentry.profile_id",
    Ut = "sentry.exclusive_time";
  function Bt(t) {
    if (t) {
      if ("object" == typeof t && "deref" in t && "function" == typeof t.deref)
        try {
          return t.deref();
        } catch {
          return;
        }
      return t;
    }
  }
  function Ft(t) {
    const n = t;
    return {
      scope: n._sentryScope,
      isolationScope: Bt(n._sentryIsolationScope),
    };
  }
  const qt = "sentry-",
    Ht = /^sentry-/;
  function Wt(t) {
    const n = (function (t) {
      if (!t || (!C(t) && !Array.isArray(t))) return;
      if (Array.isArray(t))
        return t.reduce((t, n) => {
          const e = Gt(n);
          return (
            Object.entries(e).forEach(([n, e]) => {
              t[n] = e;
            }),
            t
          );
        }, {});
      return Gt(t);
    })(t);
    if (!n) return;
    const e = Object.entries(n).reduce((t, [n, e]) => {
      if (n.match(Ht)) {
        t[n.slice(7)] = e;
      }
      return t;
    }, {});
    return Object.keys(e).length > 0 ? e : void 0;
  }
  function zt(t) {
    if (!t) return;
    return (function (t) {
      if (0 === Object.keys(t).length) return;
      return Object.entries(t).reduce((t, [n, e], r) => {
        const o = `${encodeURIComponent(n)}=${encodeURIComponent(e)}`,
          i = 0 === r ? o : `${t},${o}`;
        return i.length > 8192 ? t : i;
      }, "");
    })(
      Object.entries(t).reduce(
        (t, [n, e]) => (e && (t[`${qt}${n}`] = e), t),
        {},
      ),
    );
  }
  function Gt(t) {
    return t
      .split(",")
      .map((t) => {
        const n = t.indexOf("=");
        if (-1 === n) return [];
        return [t.slice(0, n), t.slice(n + 1)].map((t) => {
          try {
            return decodeURIComponent(t.trim());
          } catch {
            return;
          }
        });
      })
      .reduce((t, [n, e]) => (n && e && (t[n] = e), t), {});
  }
  const Jt = /^o(\d+)\./,
    Xt = /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+)?)?@)([\w.-]+)(?::(\d+))?\/(.+)/;
  function Yt(t, n = !1) {
    const {
      host: e,
      path: r,
      pass: o,
      port: i,
      projectId: s,
      protocol: c,
      publicKey: u,
    } = t;
    return `${c}://${u}${n && o ? `:${o}` : ""}@${e}${i ? `:${i}` : ""}/${r ? `${r}/` : r}${s}`;
  }
  function Kt(t) {
    return {
      protocol: t.protocol,
      publicKey: t.publicKey || "",
      pass: t.pass || "",
      host: t.host,
      port: t.port || "",
      path: t.path || "",
      projectId: t.projectId,
    };
  }
  function Vt(t) {
    const n = t.getOptions(),
      { host: e } = t.getDsn() || {};
    let r;
    return (
      n.orgId
        ? (r = String(n.orgId))
        : e &&
          (r = (function (t) {
            const n = t.match(Jt);
            return n?.[1];
          })(e)),
      r
    );
  }
  function Zt(t) {
    const n =
      "string" == typeof t
        ? (function (t) {
            const n = Xt.exec(t);
            if (!n)
              return void u(() => {
                console.error(`Invalid Sentry Dsn: ${t}`);
              });
            const [e, r, o = "", i = "", s = "", c = ""] = n.slice(1);
            let a = "",
              f = c;
            const l = f.split("/");
            if (
              (l.length > 1 && ((a = l.slice(0, -1).join("/")), (f = l.pop())),
              f)
            ) {
              const t = f.match(/^\d+/);
              t && (f = t[0]);
            }
            return Kt({
              host: i,
              pass: o,
              path: a,
              projectId: f,
              port: s,
              protocol: e,
              publicKey: r,
            });
          })(t)
        : Kt(t);
    if (n) return n;
  }
  function Qt(t) {
    if ("boolean" == typeof t) return Number(t);
    const n = "string" == typeof t ? parseFloat(t) : t;
    return "number" != typeof n || isNaN(n) || n < 0 || n > 1 ? void 0 : n;
  }
  const tn = new RegExp(
    "^[ \\t]*([0-9a-f]{32})?-?([0-9a-f]{16})?-?([01])?[ \\t]*$",
  );
  function nn(t, n) {
    const e = (function (t) {
        if (!t) return;
        const n = t.match(tn);
        if (!n) return;
        let e;
        return (
          "1" === n[3] ? (e = !0) : "0" === n[3] && (e = !1),
          { traceId: n[1], parentSampled: e, parentSpanId: n[2] }
        );
      })(t),
      r = Wt(n);
    if (!e?.traceId) return { traceId: mt(), sampleRand: Math.random() };
    const o = (function (t, n) {
      const e = Qt(n?.sample_rand);
      if (void 0 !== e) return e;
      const r = Qt(n?.sample_rate);
      return r && void 0 !== t?.parentSampled
        ? t.parentSampled
          ? Math.random() * r
          : r + Math.random() * (1 - r)
        : Math.random();
    })(e, r);
    r && (r.sample_rand = o.toString());
    const { traceId: i, parentSpanId: s, parentSampled: c } = e;
    return {
      traceId: i,
      parentSpanId: s,
      sampled: c,
      dsc: r || {},
      sampleRand: o,
    };
  }
  function en(t = mt(), n = yt(), e) {
    let r = "";
    return (void 0 !== e && (r = e ? "-1" : "-0"), `${t}-${n}${r}`);
  }
  function rn(t = mt(), n = yt(), e) {
    return `00-${t}-${n}-${e ? "01" : "00"}`;
  }
  let on = !1;
  function sn(t) {
    const { spanId: n, traceId: e, isRemote: r } = t.spanContext(),
      o = r ? n : ln(t).parent_span_id,
      i = Ft(t).scope;
    return {
      parent_span_id: o,
      span_id: r ? i?.getPropagationContext().propagationSpanId || yt() : n,
      trace_id: e,
    };
  }
  function cn(t) {
    const { traceId: n, spanId: e } = t.spanContext();
    return en(n, e, dn(t));
  }
  function un(t) {
    return t && t.length > 0
      ? t.map(
          ({
            context: { spanId: t, traceId: n, traceFlags: e, ...r },
            attributes: o,
          }) => ({
            span_id: t,
            trace_id: n,
            sampled: 1 === e,
            attributes: o,
            ...r,
          }),
        )
      : void 0;
  }
  function an(t) {
    return "number" == typeof t
      ? fn(t)
      : Array.isArray(t)
        ? t[0] + t[1] / 1e9
        : t instanceof Date
          ? fn(t.getTime())
          : lt();
  }
  function fn(t) {
    return t > 9999999999 ? t / 1e3 : t;
  }
  function ln(t) {
    if (
      (function (t) {
        return "function" == typeof t.getSpanJSON;
      })(t)
    )
      return t.getSpanJSON();
    const { spanId: n, traceId: e } = t.spanContext();
    if (
      (function (t) {
        const n = t;
        return !!(
          n.attributes &&
          n.startTime &&
          n.name &&
          n.endTime &&
          n.status
        );
      })(t)
    ) {
      const {
        attributes: r,
        startTime: o,
        name: i,
        endTime: s,
        status: c,
        links: u,
      } = t;
      return {
        span_id: n,
        trace_id: e,
        data: r,
        description: i,
        parent_span_id:
          "parentSpanId" in t
            ? t.parentSpanId
            : "parentSpanContext" in t
              ? t.parentSpanContext?.spanId
              : void 0,
        start_timestamp: an(o),
        timestamp: an(s) || void 0,
        status: hn(c),
        op: r[Pt],
        origin: r[Lt],
        links: un(u),
      };
    }
    return { span_id: n, trace_id: e, start_timestamp: 0, data: {} };
  }
  function dn(t) {
    const { traceFlags: n } = t.spanContext();
    return 1 === n;
  }
  function hn(t) {
    if (t && 0 !== t.code)
      return 1 === t.code ? "ok" : t.message || "internal_error";
  }
  function pn(t) {
    return t._sentryRootSpan || t;
  }
  function mn() {
    const t = kt(r());
    return t.getActiveSpan ? t.getActiveSpan() : bt(It());
  }
  function yn() {
    on ||
      (u(() => {
        console.warn(
          "[Sentry] Returning null from `beforeSendSpan` is disallowed. To drop certain spans, configure the respective integrations directly or use `ignoreSpans`.",
        );
      }),
      (on = !0));
  }
  function gn(t, n) {
    if (!n?.length || !t.description) return !1;
    for (const e of n) {
      if (bn(e)) {
        if (tt(t.description, e)) return !0;
        continue;
      }
      if (!e.name && !e.op) continue;
      const n = !e.name || tt(t.description, e.name),
        r = !e.op || (t.op && tt(t.op, e.op));
      if (n && r) return !0;
    }
    return !1;
  }
  function vn(t, n) {
    const e = n.parent_span_id,
      r = n.span_id;
    if (e) for (const n of t) n.parent_span_id === r && (n.parent_span_id = e);
  }
  function bn(t) {
    return "string" == typeof t || t instanceof RegExp;
  }
  const _n = "production";
  function wn(t, n) {
    const e = n.getOptions(),
      { publicKey: r } = n.getDsn() || {},
      o = {
        environment: e.environment || _n,
        release: e.release,
        public_key: r,
        trace_id: t,
        org_id: Vt(n),
      };
    return (n.emit("createDsc", o), o);
  }
  function En(t, n) {
    const e = n.getPropagationContext();
    return e.dsc || wn(e.traceId, t);
  }
  function Sn(t) {
    const n = Rt();
    if (!n) return {};
    const e = pn(t),
      r = ln(e),
      o = r.data,
      i = e.spanContext().traceState,
      s =
        i?.get("sentry.sample_rate") ??
        o[At] ??
        o["sentry.previous_trace_sample_rate"];
    function c(t) {
      return (
        ("number" != typeof s && "string" != typeof s) ||
          (t.sample_rate = `${s}`),
        t
      );
    }
    const u = e._frozenDsc;
    if (u) return c(u);
    const a = i?.get("sentry.dsc"),
      f = a && Wt(a);
    if (f) return c(f);
    const l = wn(t.spanContext().traceId, n),
      d = o[Mt],
      h = r.description;
    return (
      "url" !== d && h && (l.transaction = h),
      (function () {
        if ("boolean" == typeof __SENTRY_TRACING__ && !__SENTRY_TRACING__)
          return !1;
        const t = Rt()?.getOptions();
        return !(!t || (null == t.tracesSampleRate && !t.tracesSampler));
      })() &&
        ((l.sampled = String(dn(e))),
        (l.sample_rand =
          i?.get("sentry.sample_rand") ??
          Ft(e).scope?.getPropagationContext().sampleRand.toString())),
      c(l),
      n.emit("createDsc", l, e),
      l
    );
  }
  function $n(t, n = 100, e = 1 / 0) {
    try {
      return kn("", t, n, e);
    } catch (t) {
      return { ERROR: `**non-serializable** (${t})` };
    }
  }
  function xn(t, n = 3, e = 102400) {
    const r = $n(t, n);
    return (
      (o = r),
      (function (t) {
        return ~-encodeURI(t).split(/%..|./).length;
      })(JSON.stringify(o)) > e
        ? xn(t, n - 1, e)
        : r
    );
    var o;
  }
  function kn(
    t,
    n,
    e = 1 / 0,
    r = 1 / 0,
    o = (function () {
      const t = new WeakSet();
      function n(n) {
        return !!t.has(n) || (t.add(n), !1);
      }
      function e(n) {
        t.delete(n);
      }
      return [n, e];
    })(),
  ) {
    const [i, s] = o;
    if (
      null == n ||
      ["boolean", "string"].includes(typeof n) ||
      ("number" == typeof n && Number.isFinite(n))
    )
      return n;
    const c = (function (t, n) {
      try {
        if ("domain" === t && n && "object" == typeof n && n.U)
          return "[Domain]";
        if ("domainEmitter" === t) return "[DomainEmitter]";
        if ("undefined" != typeof global && n === global) return "[Global]";
        if ("undefined" != typeof window && n === window) return "[Window]";
        if ("undefined" != typeof document && n === document)
          return "[Document]";
        if (U(n)) return g(n);
        if (
          P((e = n)) &&
          "nativeEvent" in e &&
          "preventDefault" in e &&
          "stopPropagation" in e
        )
          return "[SyntheticEvent]";
        if ("number" == typeof n && !Number.isFinite(n)) return `[${n}]`;
        if ("function" == typeof n) return `[Function: ${m(n)}]`;
        if ("symbol" == typeof n) return `[${String(n)}]`;
        if ("bigint" == typeof n) return `[BigInt: ${String(n)}]`;
        const r = (function (t) {
          const n = Object.getPrototypeOf(t);
          return n?.constructor ? n.constructor.name : "null prototype";
        })(n);
        return /^HTML(\w*)Element$/.test(r)
          ? `[HTMLElement: ${r}]`
          : `[object ${r}]`;
      } catch (t) {
        return `**non-serializable** (${t})`;
      }
      var e;
    })(t, n);
    if (!c.startsWith("[object ")) return c;
    if (n.__sentry_skip_normalization__) return n;
    const u =
      "number" == typeof n.__sentry_override_normalization_depth__
        ? n.__sentry_override_normalization_depth__
        : e;
    if (0 === u) return c.replace("object ", "");
    if (i(n)) return "[Circular ~]";
    const a = n;
    if (a && "function" == typeof a.toJSON)
      try {
        return kn("", a.toJSON(), u - 1, r, o);
      } catch {}
    const f = Array.isArray(n) ? [] : {};
    let l = 0;
    const d = Y(n);
    for (const t in d) {
      if (!Object.prototype.hasOwnProperty.call(d, t)) continue;
      if (l >= r) {
        f[t] = "[MaxProperties ~]";
        break;
      }
      const n = d[t];
      ((f[t] = kn(t, n, u - 1, r, o)), l++);
    }
    return (s(n), f);
  }
  function In(t, n = []) {
    return [t, n];
  }
  function jn(t, n) {
    const [e, r] = t;
    return [e, [...r, n]];
  }
  function Tn(t, n) {
    const e = t[1];
    for (const t of e) {
      if (n(t, t[0].type)) return !0;
    }
    return !1;
  }
  function On(t) {
    const e = o(n);
    return e.encodePolyfill ? e.encodePolyfill(t) : new TextEncoder().encode(t);
  }
  function Rn(t) {
    const [n, e] = t;
    let r = JSON.stringify(n);
    function o(t) {
      "string" == typeof r
        ? (r = "string" == typeof t ? r + t : [On(r), t])
        : r.push("string" == typeof t ? On(t) : t);
    }
    for (const t of e) {
      const [n, e] = t;
      if (
        (o(`\n${JSON.stringify(n)}\n`),
        "string" == typeof e || e instanceof Uint8Array)
      )
        o(e);
      else {
        let t;
        try {
          t = JSON.stringify(e);
        } catch {
          t = JSON.stringify($n(e));
        }
        o(t);
      }
    }
    return "string" == typeof r
      ? r
      : (function (t) {
          const n = t.reduce((t, n) => t + n.length, 0),
            e = new Uint8Array(n);
          let r = 0;
          for (const n of t) (e.set(n, r), (r += n.length));
          return e;
        })(r);
  }
  function Cn(t) {
    const n = "string" == typeof t.data ? On(t.data) : t.data;
    return [
      {
        type: "attachment",
        length: n.length,
        filename: t.filename,
        content_type: t.contentType,
        attachment_type: t.attachmentType,
      },
      n,
    ];
  }
  const Mn = {
    session: "session",
    sessions: "session",
    attachment: "attachment",
    transaction: "transaction",
    event: "error",
    client_report: "internal",
    user_report: "default",
    profile: "profile",
    profile_chunk: "profile",
    replay_event: "replay",
    replay_recording: "replay",
    check_in: "monitor",
    feedback: "feedback",
    span: "span",
    raw_security: "security",
    log: "log_item",
    metric: "metric",
    trace_metric: "metric",
  };
  function An(t) {
    return Mn[t];
  }
  function Pn(t) {
    if (!t?.sdk) return;
    const { name: n, version: e } = t.sdk;
    return { name: n, version: e };
  }
  function Ln(t, n, e, r) {
    const o = Pn(e),
      i = t.type && "replay_event" !== t.type ? t.type : "event";
    !(function (t, n) {
      if (!n) return t;
      const e = t.sdk || {};
      t.sdk = {
        ...e,
        name: e.name || n.name,
        version: e.version || n.version,
        integrations: [
          ...(t.sdk?.integrations || []),
          ...(n.integrations || []),
        ],
        packages: [...(t.sdk?.packages || []), ...(n.packages || [])],
        settings:
          t.sdk?.settings || n.settings
            ? { ...t.sdk?.settings, ...n.settings }
            : void 0,
      };
    })(t, e?.sdk);
    const s = (function (t, n, e, r) {
      const o = t.sdkProcessingMetadata?.dynamicSamplingContext;
      return {
        event_id: t.event_id,
        sent_at: new Date().toISOString(),
        ...(n && { sdk: n }),
        ...(!!e && r && { dsn: Yt(r) }),
        ...(o && { trace: o }),
      };
    })(t, o, r, n);
    delete t.sdkProcessingMetadata;
    return In(s, [[{ type: i }, t]]);
  }
  const Nn = "__SENTRY_SUPPRESS_TRACING__";
  function Dn() {
    return kt(r());
  }
  function Un(t) {
    return new Fn((n) => {
      n(t);
    });
  }
  function Bn(t) {
    return new Fn((n, e) => {
      e(t);
    });
  }
  class Fn {
    constructor(t) {
      ((this.B = 0), (this.F = []), this.q(t));
    }
    then(t, n) {
      return new Fn((e, r) => {
        (this.F.push([
          !1,
          (n) => {
            if (t)
              try {
                e(t(n));
              } catch (t) {
                r(t);
              }
            else e(n);
          },
          (t) => {
            if (n)
              try {
                e(n(t));
              } catch (t) {
                r(t);
              }
            else r(t);
          },
        ]),
          this.H());
      });
    }
    catch(t) {
      return this.then((t) => t, t);
    }
    finally(t) {
      return new Fn((n, e) => {
        let r, o;
        return this.then(
          (n) => {
            ((o = !1), (r = n), t && t());
          },
          (n) => {
            ((o = !0), (r = n), t && t());
          },
        ).then(() => {
          o ? e(r) : n(r);
        });
      });
    }
    H() {
      if (0 === this.B) return;
      const t = this.F.slice();
      ((this.F = []),
        t.forEach((t) => {
          t[0] ||
            (1 === this.B && t[1](this.W),
            2 === this.B && t[2](this.W),
            (t[0] = !0));
        }));
    }
    q(t) {
      const n = (t, n) => {
          0 === this.B &&
            (N(n) ? n.then(e, r) : ((this.B = t), (this.W = n), this.H()));
        },
        e = (t) => {
          n(1, t);
        },
        r = (t) => {
          n(2, t);
        };
      try {
        t(e, r);
      } catch (t) {
        r(t);
      }
    }
  }
  function qn(t, n, e, r = 0) {
    try {
      const o = Hn(n, e, t, r);
      return N(o) ? o : Un(o);
    } catch (t) {
      return Bn(t);
    }
  }
  function Hn(t, n, e, r) {
    const o = e[r];
    if (!t || !o) return t;
    const i = o({ ...t }, n);
    return N(i) ? i.then((t) => Hn(t, n, e, r + 1)) : Hn(i, n, e, r + 1);
  }
  function Wn(t, n) {
    const {
      fingerprint: e,
      span: r,
      breadcrumbs: o,
      sdkProcessingMetadata: i,
    } = n;
    (!(function (t, n) {
      const {
        extra: e,
        tags: r,
        user: o,
        contexts: i,
        level: s,
        transactionName: c,
      } = n;
      Object.keys(e).length && (t.extra = { ...e, ...t.extra });
      Object.keys(r).length && (t.tags = { ...r, ...t.tags });
      Object.keys(o).length && (t.user = { ...o, ...t.user });
      Object.keys(i).length && (t.contexts = { ...i, ...t.contexts });
      s && (t.level = s);
      c && "transaction" !== t.type && (t.transaction = c);
    })(t, n),
      r &&
        (function (t, n) {
          ((t.contexts = { trace: sn(n), ...t.contexts }),
            (t.sdkProcessingMetadata = {
              dynamicSamplingContext: Sn(n),
              ...t.sdkProcessingMetadata,
            }));
          const e = pn(n),
            r = ln(e).description;
          r &&
            !t.transaction &&
            "transaction" === t.type &&
            (t.transaction = r);
        })(t, r),
      (function (t, n) {
        ((t.fingerprint = t.fingerprint
          ? Array.isArray(t.fingerprint)
            ? t.fingerprint
            : [t.fingerprint]
          : []),
          n && (t.fingerprint = t.fingerprint.concat(n)));
        t.fingerprint.length || delete t.fingerprint;
      })(t, e),
      (function (t, n) {
        const e = [...(t.breadcrumbs || []), ...n];
        t.breadcrumbs = e.length ? e : void 0;
      })(t, o),
      (function (t, n) {
        t.sdkProcessingMetadata = { ...t.sdkProcessingMetadata, ...n };
      })(t, i));
  }
  function zn(t, n) {
    const {
      extra: e,
      tags: r,
      user: o,
      contexts: i,
      level: s,
      sdkProcessingMetadata: c,
      breadcrumbs: u,
      fingerprint: a,
      eventProcessors: f,
      attachments: l,
      propagationContext: d,
      transactionName: h,
      span: p,
    } = n;
    (Gn(t, "extra", e),
      Gn(t, "tags", r),
      Gn(t, "user", o),
      Gn(t, "contexts", i),
      (t.sdkProcessingMetadata = pt(t.sdkProcessingMetadata, c, 2)),
      s && (t.level = s),
      h && (t.transactionName = h),
      p && (t.span = p),
      u.length && (t.breadcrumbs = [...t.breadcrumbs, ...u]),
      a.length && (t.fingerprint = [...t.fingerprint, ...a]),
      f.length && (t.eventProcessors = [...t.eventProcessors, ...f]),
      l.length && (t.attachments = [...t.attachments, ...l]),
      (t.propagationContext = { ...t.propagationContext, ...d }));
  }
  function Gn(t, n, e) {
    t[n] = pt(t[n], e, 1);
  }
  let Jn, Xn, Yn, Kn;
  function Vn(t, e, r, o, i, s) {
    const { normalizeDepth: c = 3, normalizeMaxBreadth: u = 1e3 } = t,
      a = {
        ...e,
        event_id: e.event_id || r.event_id || rt(),
        timestamp: e.timestamp || at(),
      },
      f = r.integrations || t.integrations.map((t) => t.name);
    (!(function (t, n) {
      const { environment: e, release: r, dist: o, maxValueLength: i } = n;
      ((t.environment = t.environment || e || _n),
        !t.release && r && (t.release = r));
      !t.dist && o && (t.dist = o);
      const s = t.request;
      s?.url && i && (s.url = Z(s.url, i));
      i &&
        t.exception?.values?.forEach((t) => {
          t.value && (t.value = Z(t.value, i));
        });
    })(a, t),
      (function (t, n) {
        n.length > 0 &&
          ((t.sdk = t.sdk || {}),
          (t.sdk.integrations = [...(t.sdk.integrations || []), ...n]));
      })(a, f),
      i && i.emit("applyFrameMetadata", e),
      void 0 === e.type &&
        (function (t, e) {
          const r = (function (t) {
            const e = n._sentryDebugIds,
              r = n.G;
            if (!e && !r) return {};
            const o = e ? Object.keys(e) : [],
              i = r ? Object.keys(r) : [];
            if (Kn && o.length === Xn && i.length === Yn) return Kn;
            ((Xn = o.length), (Yn = i.length), (Kn = {}), Jn || (Jn = {}));
            const s = (n, e) => {
              for (const r of n) {
                const n = e[r],
                  o = Jn?.[r];
                if (o && Kn && n) ((Kn[o[0]] = n), Jn && (Jn[r] = [o[0], n]));
                else if (n) {
                  const e = t(r);
                  for (let t = e.length - 1; t >= 0; t--) {
                    const o = e[t],
                      i = o?.filename;
                    if (i && Kn && Jn) {
                      ((Kn[i] = n), (Jn[r] = [i, n]));
                      break;
                    }
                  }
                }
              }
            };
            return (e && s(o, e), r && s(i, r), Kn);
          })(e);
          t.exception?.values?.forEach((t) => {
            t.stacktrace?.frames?.forEach((t) => {
              t.filename && (t.debug_id = r[t.filename]);
            });
          });
        })(a, t.stackParser));
    const l = (function (t, n) {
      if (!n) return t;
      const e = t ? t.clone() : new _t();
      return (e.update(n), e);
    })(o, r.captureContext);
    r.mechanism && ct(a, r.mechanism);
    const d = i ? i.getEventProcessors() : [],
      h = Tt().getScopeData();
    if (s) {
      zn(h, s.getScopeData());
    }
    if (l) {
      zn(h, l.getScopeData());
    }
    const p = [...(r.attachments || []), ...h.attachments];
    (p.length && (r.attachments = p), Wn(a, h));
    return qn([...d, ...h.eventProcessors], a, r).then(
      (t) => (
        t &&
          (function (t) {
            const n = {};
            if (
              (t.exception?.values?.forEach((t) => {
                t.stacktrace?.frames?.forEach((t) => {
                  t.debug_id &&
                    (t.abs_path
                      ? (n[t.abs_path] = t.debug_id)
                      : t.filename && (n[t.filename] = t.debug_id),
                    delete t.debug_id);
                });
              }),
              0 === Object.keys(n).length)
            )
              return;
            ((t.debug_meta = t.debug_meta || {}),
              (t.debug_meta.images = t.debug_meta.images || []));
            const e = t.debug_meta.images;
            Object.entries(n).forEach(([t, n]) => {
              e.push({ type: "sourcemap", code_file: t, debug_id: n });
            });
          })(t),
        "number" == typeof c && c > 0
          ? (function (t, n, e) {
              if (!t) return null;
              const r = {
                ...t,
                ...(t.breadcrumbs && {
                  breadcrumbs: t.breadcrumbs.map((t) => ({
                    ...t,
                    ...(t.data && { data: $n(t.data, n, e) }),
                  })),
                }),
                ...(t.user && { user: $n(t.user, n, e) }),
                ...(t.contexts && { contexts: $n(t.contexts, n, e) }),
                ...(t.extra && { extra: $n(t.extra, n, e) }),
              };
              t.contexts?.trace &&
                r.contexts &&
                ((r.contexts.trace = t.contexts.trace),
                t.contexts.trace.data &&
                  (r.contexts.trace.data = $n(t.contexts.trace.data, n, e)));
              t.spans &&
                (r.spans = t.spans.map((t) => ({
                  ...t,
                  ...(t.data && { data: $n(t.data, n, e) }),
                })));
              t.contexts?.flags &&
                r.contexts &&
                (r.contexts.flags = $n(t.contexts.flags, 3, e));
              return r;
            })(t, c, u)
          : t
      ),
    );
  }
  function Zn(t) {
    if (t)
      return (function (t) {
        return t instanceof _t || "function" == typeof t;
      })(t) ||
        (function (t) {
          return Object.keys(t).some((t) => Qn.includes(t));
        })(t)
        ? { captureContext: t }
        : t;
  }
  const Qn = [
    "user",
    "level",
    "extra",
    "contexts",
    "tags",
    "fingerprint",
    "propagationContext",
  ];
  function captureException(t, n) {
    return It().captureException(t, Zn(n));
  }
  function te(t, n) {
    return It().captureEvent(t, n);
  }
  function ne() {
    return jt().lastEventId();
  }
  function ee() {
    const t = Rt();
    return !1 !== t?.getOptions().enabled && !!t?.getTransport();
  }
  function re(t) {
    const e = jt(),
      r = It(),
      { userAgent: o } = n.navigator || {},
      i = dt({
        user: r.getUser() || e.getUser(),
        ...(o && { userAgent: o }),
        ...t,
      }),
      s = e.getSession();
    return (
      "ok" === s?.status && ht(s, { status: "exited" }),
      oe(),
      e.setSession(i),
      i
    );
  }
  function oe() {
    const t = jt(),
      n = It().getSession() || t.getSession();
    (n &&
      (function (t) {
        let n = {};
        ("ok" === t.status && (n = { status: "exited" }), ht(t, n));
      })(n),
      ie(),
      t.setSession());
  }
  function ie() {
    const t = jt(),
      n = Rt(),
      e = t.getSession();
    e && n && n.captureSession(e);
  }
  function se(t = !1) {
    t ? oe() : ie();
  }
  function ce(t) {
    const n = t.protocol ? `${t.protocol}:` : "",
      e = t.port ? `:${t.port}` : "";
    return `${n}//${t.host}${e}${t.path ? `/${t.path}` : ""}/api/`;
  }
  function ue(t, n, e) {
    return (
      n ||
      `${(function (t) {
        return `${ce(t)}${t.projectId}/envelope/`;
      })(t)}?${(function (t, n) {
        const e = { sentry_version: "7" };
        return (
          t.publicKey && (e.sentry_key = t.publicKey),
          n && (e.sentry_client = `${n.name}/${n.version}`),
          new URLSearchParams(e).toString()
        );
      })(t, e)}`
    );
  }
  const ae = [];
  function fe(t) {
    const n = t.defaultIntegrations || [],
      e = t.integrations;
    let r;
    if (
      (n.forEach((t) => {
        t.isDefaultInstance = !0;
      }),
      Array.isArray(e))
    )
      r = [...n, ...e];
    else if ("function" == typeof e) {
      const t = e(n);
      r = Array.isArray(t) ? t : [t];
    } else r = n;
    return (function (t) {
      const n = {};
      return (
        t.forEach((t) => {
          const { name: e } = t,
            r = n[e];
          (r && !r.isDefaultInstance && t.isDefaultInstance) || (n[e] = t);
        }),
        Object.values(n)
      );
    })(r);
  }
  function le(t, n) {
    for (const e of n) e?.afterAllSetup && e.afterAllSetup(t);
  }
  function de(t, n, e) {
    if (!e[n.name]) {
      if (
        ((e[n.name] = n),
        ae.includes(n.name) ||
          "function" != typeof n.setupOnce ||
          (n.setupOnce(), ae.push(n.name)),
        n.setup && "function" == typeof n.setup && n.setup(t),
        "function" == typeof n.preprocessEvent)
      ) {
        const e = n.preprocessEvent.bind(n);
        t.on("preprocessEvent", (n, r) => e(n, r, t));
      }
      if ("function" == typeof n.processEvent) {
        const e = n.processEvent.bind(n),
          r = Object.assign((n, r) => e(n, r, t), { id: n.name });
        t.addEventProcessor(r);
      }
    }
  }
  function he(t, n) {
    const e =
      n ??
      (function (t) {
        return pe().get(t);
      })(t) ??
      [];
    if (0 === e.length) return;
    const r = t.getOptions(),
      o = (function (t, n, e, r) {
        const o = {};
        return (
          n?.sdk && (o.sdk = { name: n.sdk.name, version: n.sdk.version }),
          e && r && (o.dsn = Yt(r)),
          In(o, [
            ((i = t),
            [
              {
                type: "log",
                item_count: i.length,
                content_type: "application/vnd.sentry.items.log+json",
              },
              { items: i },
            ]),
          ])
        );
        var i;
      })(e, r._metadata, r.tunnel, t.getDsn());
    (pe().set(t, []), t.emit("flushLogs"), t.sendEnvelope(o));
  }
  function pe() {
    return i("clientToLogBufferMap", () => new WeakMap());
  }
  function me(t) {
    switch (typeof t) {
      case "number":
        return Number.isInteger(t)
          ? { value: t, type: "integer" }
          : { value: t, type: "double" };
      case "boolean":
        return { value: t, type: "boolean" };
      case "string":
        return { value: t, type: "string" };
      default: {
        let n = "";
        try {
          n = JSON.stringify(t) ?? "";
        } catch {}
        return { value: n, type: "string" };
      }
    }
  }
  function ye(t, n, e, r = !0) {
    !e || (!r && n in t) || (t[n] = e);
  }
  function ge(t, n) {
    const e = Ee(),
      r = we(t);
    void 0 === r
      ? e.set(t, [n])
      : r.length >= 1e3
        ? (_e(t, r), e.set(t, [n]))
        : e.set(t, [...r, n]);
  }
  function ve(t, n, e) {
    const { release: r, environment: o } = n.getOptions(),
      i = { ...t.attributes },
      {
        user: { id: s, email: c, username: u },
      } = (function (t) {
        const n = Tt().getScopeData();
        return (zn(n, jt().getScopeData()), zn(n, t.getScopeData()), n);
      })(e);
    (ye(i, "user.id", s, !1),
      ye(i, "user.email", c, !1),
      ye(i, "user.name", u, !1),
      ye(i, "sentry.release", r),
      ye(i, "sentry.environment", o));
    const { name: a, version: f } = n.getSdkMetadata()?.sdk ?? {};
    (ye(i, "sentry.sdk.name", a), ye(i, "sentry.sdk.version", f));
    const l = n.getIntegrationByName("Replay"),
      d = l?.getReplayId(!0);
    return (
      ye(i, "sentry.replay_id", d),
      d &&
        "buffer" === l?.getRecordingMode() &&
        ye(i, "sentry._internal.replay_is_buffering", !0),
      { ...t, attributes: i }
    );
  }
  function be(t, n, e) {
    const r = {};
    for (const n in t.attributes)
      void 0 !== t.attributes[n] && (r[n] = me(t.attributes[n]));
    const [, o] = (function (t, n) {
        return n
          ? Ot(n, () => {
              const e = mn(),
                r = e ? sn(e) : Ct(n);
              return [e ? Sn(e) : En(t, n), r];
            })
          : [void 0, void 0];
      })(n, e),
      i = bt(e),
      s = i ? i.spanContext().traceId : o?.trace_id,
      c = i ? i.spanContext().spanId : void 0;
    return {
      timestamp: lt(),
      trace_id: s ?? "",
      span_id: c,
      name: t.name,
      type: t.type,
      unit: t.unit,
      value: t.value,
      attributes: r,
    };
  }
  function _e(t, n) {
    const e = n ?? we(t) ?? [];
    if (0 === e.length) return;
    const r = t.getOptions(),
      o = (function (t, n, e, r) {
        const o = {};
        return (
          n?.sdk && (o.sdk = { name: n.sdk.name, version: n.sdk.version }),
          e && r && (o.dsn = Yt(r)),
          In(o, [
            ((i = t),
            [
              {
                type: "trace_metric",
                item_count: i.length,
                content_type: "application/vnd.sentry.items.trace-metric+json",
              },
              { items: i },
            ]),
          ])
        );
        var i;
      })(e, r._metadata, r.tunnel, t.getDsn());
    (Ee().set(t, []), t.emit("flushMetrics"), t.sendEnvelope(o));
  }
  function we(t) {
    return Ee().get(t);
  }
  function Ee() {
    return i("clientToMetricBufferMap", () => new WeakMap());
  }
  const Se = Symbol.for("SentryBufferFullError");
  function $e(t = 100) {
    const n = new Set();
    function e(t) {
      n.delete(t);
    }
    return {
      get $() {
        return Array.from(n);
      },
      add: function (r) {
        if (!(n.size < t)) return Bn(Se);
        const o = r();
        return (
          n.add(o),
          o.then(
            () => e(o),
            () => e(o),
          ),
          o
        );
      },
      drain: function (t) {
        if (!n.size) return Un(!0);
        const e = Promise.allSettled(Array.from(n)).then(() => !0);
        if (!t) return e;
        const r = [e, new Promise((n) => setTimeout(() => n(!1), t))];
        return Promise.race(r);
      },
    };
  }
  function xe(t, { statusCode: n, headers: e }, r = Date.now()) {
    const o = { ...t },
      i = e?.["x-sentry-rate-limits"],
      s = e?.["retry-after"];
    if (i)
      for (const t of i.trim().split(",")) {
        const [n, e, , , i] = t.split(":", 5),
          s = parseInt(n, 10),
          c = 1e3 * (isNaN(s) ? 60 : s);
        if (e)
          for (const t of e.split(";"))
            ("metric_bucket" === t && i && !i.split(";").includes("custom")) ||
              (o[t] = r + c);
        else o.all = r + c;
      }
    else
      s
        ? (o.all =
            r +
            (function (t, n = Date.now()) {
              const e = parseInt(`${t}`, 10);
              if (!isNaN(e)) return 1e3 * e;
              const r = Date.parse(`${t}`);
              return isNaN(r) ? 6e4 : r - n;
            })(s, r))
        : 429 === n && (o.all = r + 6e4);
    return o;
  }
  function ke(t, n, e = $e(t.bufferSize || 64)) {
    let r = {};
    return {
      send: function (o) {
        const i = [];
        if (
          (Tn(o, (n, e) => {
            const o = An(e);
            !(function (t, n, e = Date.now()) {
              return (
                (function (t, n) {
                  return t[n] || t.all || 0;
                })(t, n) > e
              );
            })(r, o)
              ? i.push(n)
              : t.recordDroppedEvent("ratelimit_backoff", o);
          }),
          0 === i.length)
        )
          return Promise.resolve({});
        const s = In(o[0], i),
          c = (n) => {
            Tn(s, (e, r) => {
              t.recordDroppedEvent(n, An(r));
            });
          };
        return e
          .add(() =>
            n({ body: Rn(s) }).then(
              (t) => ((r = xe(r, t)), t),
              (t) => {
                throw (c("network_error"), t);
              },
            ),
          )
          .then(
            (t) => t,
            (t) => {
              if (t === Se) return (c("queue_overflow"), Promise.resolve({}));
              throw t;
            },
          );
      },
      flush: (t) => e.drain(t),
    };
  }
  const Ie = Symbol.for("SentryInternalError"),
    je = Symbol.for("SentryDoNotSendEventError");
  function Te(t) {
    return { message: t, [Ie]: !0 };
  }
  function Oe(t) {
    return { message: t, [je]: !0 };
  }
  function Re(t, n, e, r, o) {
    let i,
      s = 0,
      c = !1;
    (t.on(e, () => {
      ((s = 0), clearTimeout(i), (c = !1));
    }),
      t.on(n, (n) => {
        ((s += r(n)),
          s >= 8e5
            ? o(t)
            : c ||
              ((c = !0),
              (i = setTimeout(() => {
                o(t);
              }, 5e3))));
      }),
      t.on("flush", () => {
        o(t);
      }));
  }
  class Ce {
    constructor(t) {
      if (
        ((this.J = t),
        (this._integrations = {}),
        (this.X = 0),
        (this.Y = {}),
        (this.K = {}),
        (this.u = []),
        (this.V = $e(t.transportOptions?.bufferSize ?? 64)),
        t.dsn && (this.Z = Zt(t.dsn)),
        this.Z)
      ) {
        const n = ue(this.Z, t.tunnel, t._metadata ? t._metadata.sdk : void 0);
        this.tt = t.transport({
          tunnel: this.J.tunnel,
          recordDroppedEvent: this.recordDroppedEvent.bind(this),
          ...t.transportOptions,
          url: n,
        });
      }
      ((this.J.enableLogs =
        this.J.enableLogs ?? this.J._experiments?.enableLogs),
        this.J.enableLogs && Re(this, "afterCaptureLog", "flushLogs", Ne, he));
      (this.J.enableMetrics ?? this.J._experiments?.enableMetrics ?? !0) &&
        Re(this, "afterCaptureMetric", "flushMetrics", Le, _e);
    }
    captureException(t, n, e) {
      const r = rt();
      if (ut(t)) return r;
      const o = { event_id: r, ...n };
      return (
        this.nt(
          () =>
            this.eventFromException(t, o)
              .then((t) => this.et(t, o, e))
              .then((t) => t),
          "error",
        ),
        o.event_id
      );
    }
    captureMessage(t, n, e, r) {
      const o = { event_id: rt(), ...e },
        i = M(t) ? t : String(t),
        s = A(t),
        c = s ? this.eventFromMessage(i, n, o) : this.eventFromException(t, o);
      return (
        this.nt(() => c.then((t) => this.et(t, o, r)), s ? "unknown" : "error"),
        o.event_id
      );
    }
    captureEvent(t, n, e) {
      const r = rt();
      if (n?.originalException && ut(n.originalException)) return r;
      const o = { event_id: r, ...n },
        i = t.sdkProcessingMetadata || {},
        s = i.capturedSpanScope,
        c = i.capturedSpanIsolationScope,
        u = Me(t.type);
      return (this.nt(() => this.et(t, o, s || e, c), u), o.event_id);
    }
    captureSession(t) {
      (this.sendSession(t), ht(t, { init: !1 }));
    }
    getDsn() {
      return this.Z;
    }
    getOptions() {
      return this.J;
    }
    getSdkMetadata() {
      return this.J._metadata;
    }
    getTransport() {
      return this.tt;
    }
    async flush(t) {
      const n = this.tt;
      if (!n) return !0;
      this.emit("flush");
      const e = await this.rt(t),
        r = await n.flush(t);
      return e && r;
    }
    async close(t) {
      const n = await this.flush(t);
      return ((this.getOptions().enabled = !1), this.emit("close"), n);
    }
    getEventProcessors() {
      return this.u;
    }
    addEventProcessor(t) {
      this.u.push(t);
    }
    init() {
      (this.ot() ||
        this.J.integrations.some(({ name: t }) => t.startsWith("Spotlight"))) &&
        this.it();
    }
    getIntegrationByName(t) {
      return this._integrations[t];
    }
    addIntegration(t) {
      const n = this._integrations[t.name];
      (de(this, t, this._integrations), n || le(this, [t]));
    }
    sendEvent(t, n = {}) {
      this.emit("beforeSendEvent", t, n);
      let e = Ln(t, this.Z, this.J._metadata, this.J.tunnel);
      for (const t of n.attachments || []) e = jn(e, Cn(t));
      this.sendEnvelope(e).then((n) => this.emit("afterSendEvent", t, n));
    }
    sendSession(t) {
      const { release: n, environment: e = _n } = this.J;
      if ("aggregates" in t) {
        const r = t.attrs || {};
        if (!r.release && !n) return;
        ((r.release = r.release || n),
          (r.environment = r.environment || e),
          (t.attrs = r));
      } else {
        if (!t.release && !n) return;
        ((t.release = t.release || n), (t.environment = t.environment || e));
      }
      this.emit("beforeSendSession", t);
      const r = (function (t, n, e, r) {
        const o = Pn(e);
        return In(
          {
            sent_at: new Date().toISOString(),
            ...(o && { sdk: o }),
            ...(!!r && n && { dsn: Yt(n) }),
          },
          [
            "aggregates" in t
              ? [{ type: "sessions" }, t]
              : [{ type: "session" }, t.toJSON()],
          ],
        );
      })(t, this.Z, this.J._metadata, this.J.tunnel);
      this.sendEnvelope(r);
    }
    recordDroppedEvent(t, n, e = 1) {
      if (this.J.sendClientReports) {
        const r = `${t}:${n}`;
        this.Y[r] = (this.Y[r] || 0) + e;
      }
    }
    on(t, n) {
      const e = (this.K[t] = this.K[t] || new Set()),
        r = (...t) => n(...t);
      return (
        e.add(r),
        () => {
          e.delete(r);
        }
      );
    }
    emit(t, ...n) {
      const e = this.K[t];
      e && e.forEach((t) => t(...n));
    }
    async sendEnvelope(t) {
      if ((this.emit("beforeEnvelope", t), this.ot() && this.tt))
        try {
          return await this.tt.send(t);
        } catch (t) {
          return {};
        }
      return {};
    }
    it() {
      const { integrations: t } = this.J;
      ((this._integrations = (function (t, n) {
        const e = {};
        return (
          n.forEach((n) => {
            n && de(t, n, e);
          }),
          e
        );
      })(this, t)),
        le(this, t));
    }
    st(t, n) {
      let e = "fatal" === n.level,
        r = !1;
      const o = n.exception?.values;
      if (o) {
        ((r = !0), (e = !1));
        for (const t of o)
          if (!1 === t.mechanism?.handled) {
            e = !0;
            break;
          }
      }
      const i = "ok" === t.status;
      ((i && 0 === t.errors) || (i && e)) &&
        (ht(t, {
          ...(e && { status: "crashed" }),
          errors: t.errors || Number(r || e),
        }),
        this.captureSession(t));
    }
    async rt(t) {
      let n = 0;
      for (; !t || n < t; ) {
        if ((await new Promise((t) => setTimeout(t, 1)), !this.X)) return !0;
        n++;
      }
      return !1;
    }
    ot() {
      return !1 !== this.getOptions().enabled && void 0 !== this.tt;
    }
    ct(t, n, e, r) {
      const o = this.getOptions(),
        i = Object.keys(this._integrations);
      return (
        !n.integrations && i?.length && (n.integrations = i),
        this.emit("preprocessEvent", t, n),
        t.type || r.setLastEventId(t.event_id || n.event_id),
        Vn(o, t, n, e, this, r).then((t) => {
          if (null === t) return t;
          (this.emit("postprocessEvent", t, n),
            (t.contexts = { trace: Ct(e), ...t.contexts }));
          const r = En(this, e);
          return (
            (t.sdkProcessingMetadata = {
              dynamicSamplingContext: r,
              ...t.sdkProcessingMetadata,
            }),
            t
          );
        })
      );
    }
    et(t, n = {}, e = It(), r = jt()) {
      return this.ut(t, n, e, r).then(
        (t) => t.event_id,
        (t) => {},
      );
    }
    ut(t, n, e, r) {
      const o = this.getOptions(),
        { sampleRate: i } = o,
        s = Pe(t),
        c = Ae(t),
        u = `before send for type \`${t.type || "error"}\``,
        a = void 0 === i ? void 0 : Qt(i);
      if (c && "number" == typeof a && Math.random() > a)
        return (
          this.recordDroppedEvent("sample_rate", "error"),
          Bn(
            Oe(
              `Discarding event because it's not included in the random sample (sampling rate = ${i})`,
            ),
          )
        );
      const f = Me(t.type);
      return this.ct(t, n, e, r)
        .then((t) => {
          if (null === t)
            throw (
              this.recordDroppedEvent("event_processor", f),
              Oe("An event processor returned `null`, will not send event.")
            );
          if (n.data && !0 === n.data.__sentry__) return t;
          const e = (function (t, n, e, r) {
            const {
              beforeSend: o,
              beforeSendTransaction: i,
              beforeSendSpan: s,
              ignoreSpans: c,
            } = n;
            let u = e;
            if (Ae(u) && o) return o(u, r);
            if (Pe(u)) {
              if (s || c) {
                const n = (function (t) {
                  const {
                    trace_id: n,
                    parent_span_id: e,
                    span_id: r,
                    status: o,
                    origin: i,
                    data: s,
                    op: c,
                  } = t.contexts?.trace ?? {};
                  return {
                    data: s ?? {},
                    description: t.transaction,
                    op: c,
                    parent_span_id: e,
                    span_id: r ?? "",
                    start_timestamp: t.start_timestamp ?? 0,
                    status: o,
                    timestamp: t.timestamp,
                    trace_id: n ?? "",
                    origin: i,
                    profile_id: s?.[Dt],
                    exclusive_time: s?.[Ut],
                    measurements: t.measurements,
                    is_segment: !0,
                  };
                })(u);
                if (c?.length && gn(n, c)) return null;
                if (s) {
                  const t = s(n);
                  t
                    ? (u = pt(e, {
                        type: "transaction",
                        timestamp: (a = t).timestamp,
                        start_timestamp: a.start_timestamp,
                        transaction: a.description,
                        contexts: {
                          trace: {
                            trace_id: a.trace_id,
                            span_id: a.span_id,
                            parent_span_id: a.parent_span_id,
                            op: a.op,
                            status: a.status,
                            origin: a.origin,
                            data: {
                              ...a.data,
                              ...(a.profile_id && { [Dt]: a.profile_id }),
                              ...(a.exclusive_time && {
                                [Ut]: a.exclusive_time,
                              }),
                            },
                          },
                        },
                        measurements: a.measurements,
                      }))
                    : yn();
                }
                if (u.spans) {
                  const n = [],
                    e = u.spans;
                  for (const t of e)
                    if (c?.length && gn(t, c)) vn(e, t);
                    else if (s) {
                      const e = s(t);
                      e ? n.push(e) : (yn(), n.push(t));
                    } else n.push(t);
                  const r = u.spans.length - n.length;
                  (r && t.recordDroppedEvent("before_send", "span", r),
                    (u.spans = n));
                }
              }
              if (i) {
                if (u.spans) {
                  const t = u.spans.length;
                  u.sdkProcessingMetadata = {
                    ...e.sdkProcessingMetadata,
                    spanCountBeforeProcessing: t,
                  };
                }
                return i(u, r);
              }
            }
            var a;
            return u;
          })(this, o, t, n);
          return (function (t, n) {
            const e = `${n} must return \`null\` or a valid event.`;
            if (N(t))
              return t.then(
                (t) => {
                  if (!P(t) && null !== t) throw Te(e);
                  return t;
                },
                (t) => {
                  throw Te(`${n} rejected with ${t}`);
                },
              );
            if (!P(t) && null !== t) throw Te(e);
            return t;
          })(e, u);
        })
        .then((o) => {
          if (null === o) {
            if ((this.recordDroppedEvent("before_send", f), s)) {
              const n = 1 + (t.spans || []).length;
              this.recordDroppedEvent("before_send", "span", n);
            }
            throw Oe(`${u} returned \`null\`, will not send event.`);
          }
          const i = e.getSession() || r.getSession();
          if ((c && i && this.st(i, o), s)) {
            const t =
              (o.sdkProcessingMetadata?.spanCountBeforeProcessing || 0) -
              (o.spans ? o.spans.length : 0);
            t > 0 && this.recordDroppedEvent("before_send", "span", t);
          }
          const a = o.transaction_info;
          if (s && a && o.transaction !== t.transaction) {
            const t = "custom";
            o.transaction_info = { ...a, source: t };
          }
          return (this.sendEvent(o, n), o);
        })
        .then(null, (t) => {
          if (
            ((n = t) && "object" == typeof n && je in n) ||
            (function (t) {
              return !!t && "object" == typeof t && Ie in t;
            })(t)
          )
            throw t;
          var n;
          throw (
            this.captureException(t, {
              mechanism: { handled: !1, type: "internal" },
              data: { __sentry__: !0 },
              originalException: t,
            }),
            Te(
              `Event processing pipeline threw an error, original event will not be sent. Details have been sent as a new event.\nReason: ${t}`,
            )
          );
        });
    }
    nt(t, n) {
      (this.X++,
        this.V.add(t).then(
          (t) => (this.X--, t),
          (t) => (
            this.X--,
            t === Se && this.recordDroppedEvent("queue_overflow", n),
            t
          ),
        ));
    }
    ft() {
      const t = this.Y;
      return (
        (this.Y = {}),
        Object.entries(t).map(([t, n]) => {
          const [e, r] = t.split(":");
          return { reason: e, category: r, quantity: n };
        })
      );
    }
    lt() {
      const t = this.ft();
      if (0 === t.length) return;
      if (!this.Z) return;
      const n =
        ((e = t),
        In((r = this.J.tunnel && Yt(this.Z)) ? { dsn: r } : {}, [
          [{ type: "client_report" }, { timestamp: at(), discarded_events: e }],
        ]));
      var e, r;
      this.sendEnvelope(n);
    }
  }
  function Me(t) {
    return "replay_event" === t ? "replay" : t || "error";
  }
  function Ae(t) {
    return void 0 === t.type;
  }
  function Pe(t) {
    return "transaction" === t.type;
  }
  function Le(t) {
    let n = 0;
    return (t.name && (n += 2 * t.name.length), (n += 8), n + De(t.attributes));
  }
  function Ne(t) {
    let n = 0;
    return (t.message && (n += 2 * t.message.length), n + De(t.attributes));
  }
  function De(t) {
    if (!t) return 0;
    let n = 0;
    return (
      Object.values(t).forEach((t) => {
        Array.isArray(t)
          ? (n += t.length * Ue(t[0]))
          : A(t)
            ? (n += Ue(t))
            : (n += 100);
      }),
      n
    );
  }
  function Ue(t) {
    return "string" == typeof t
      ? 2 * t.length
      : "number" == typeof t
        ? 8
        : "boolean" == typeof t
          ? 4
          : 0;
  }
  function Be(t) {
    It().setClient(t);
  }
  function Fe(t) {
    if (!t) return {};
    const n = t.match(
      /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/,
    );
    if (!n) return {};
    const e = n[6] || "",
      r = n[8] || "";
    return {
      host: n[4],
      path: n[5],
      protocol: n[2],
      search: e,
      hash: r,
      relative: n[5] + e + r,
    };
  }
  function qe(t) {
    "aggregates" in t
      ? void 0 === t.attrs?.ip_address &&
        (t.attrs = { ...t.attrs, ip_address: "{{auto}}" })
      : void 0 === t.ipAddress && (t.ipAddress = "{{auto}}");
  }
  const He = 100;
  function We(t, n) {
    const e = Rt(),
      r = jt();
    if (!e) return;
    const { beforeBreadcrumb: o = null, maxBreadcrumbs: i = He } =
      e.getOptions();
    if (i <= 0) return;
    const s = { timestamp: at(), ...t },
      c = o ? u(() => o(s, n)) : s;
    null !== c &&
      (e.emit && e.emit("beforeAddBreadcrumb", c, n), r.addBreadcrumb(c, i));
  }
  let ze;
  const Ge = new WeakMap(),
    Je = () => ({
      name: "FunctionToString",
      setupOnce() {
        ze = Function.prototype.toString;
        try {
          Function.prototype.toString = function (...t) {
            const n = X(this),
              e = Ge.has(Rt()) && void 0 !== n ? n : this;
            return ze.apply(e, t);
          };
        } catch {}
      },
      setup(t) {
        Ge.set(t, !0);
      },
    }),
    Xe = [
      /^Script error\.?$/,
      /^Javascript error: Script error\.? on line 0$/,
      /^ResizeObserver loop completed with undelivered notifications.$/,
      /^Cannot redefine property: googletag$/,
      /^Can't find variable: gmo$/,
      /^undefined is not an object \(evaluating 'a\.[A-Z]'\)$/,
      'can\'t redefine non-configurable property "solana"',
      "vv().getRestrictions is not a function. (In 'vv().getRestrictions(1,a)', 'vv().getRestrictions' is undefined)",
      "Can't find variable: _AutofillCallbackHandler",
      /^Non-Error promise rejection captured with value: Object Not Found Matching Id:\d+, MethodName:simulateEvent, ParamCount:\d+$/,
      /^Java exception was raised during method invocation$/,
    ],
    Ye = (t = {}) => {
      let n;
      return {
        name: "EventFilters",
        setup(e) {
          const r = e.getOptions();
          n = Ve(t, r);
        },
        processEvent(e, r, o) {
          if (!n) {
            const e = o.getOptions();
            n = Ve(t, e);
          }
          return (function (t, n) {
            if (t.type) {
              if (
                "transaction" === t.type &&
                (function (t, n) {
                  if (!n?.length) return !1;
                  const e = t.transaction;
                  return !!e && nt(e, n);
                })(t, n.ignoreTransactions)
              )
                return !0;
            } else {
              if (
                (function (t, n) {
                  if (!n?.length) return !1;
                  return (function (t) {
                    const n = [];
                    t.message && n.push(t.message);
                    try {
                      const e =
                        t.exception.values[t.exception.values.length - 1];
                      e?.value &&
                        (n.push(e.value),
                        e.type && n.push(`${e.type}: ${e.value}`));
                    } catch {}
                    return n;
                  })(t).some((t) => nt(t, n));
                })(t, n.ignoreErrors)
              )
                return !0;
              if (
                (function (t) {
                  if (!t.exception?.values?.length) return !1;
                  return (
                    !t.message &&
                    !t.exception.values.some(
                      (t) =>
                        t.stacktrace ||
                        (t.type && "Error" !== t.type) ||
                        t.value,
                    )
                  );
                })(t)
              )
                return !0;
              if (
                (function (t, n) {
                  if (!n?.length) return !1;
                  const e = Ze(t);
                  return !!e && nt(e, n);
                })(t, n.denyUrls)
              )
                return !0;
              if (
                !(function (t, n) {
                  if (!n?.length) return !0;
                  const e = Ze(t);
                  return !e || nt(e, n);
                })(t, n.allowUrls)
              )
                return !0;
            }
            return !1;
          })(e, n)
            ? null
            : e;
        },
      };
    },
    Ke = (t = {}) => ({ ...Ye(t), name: "InboundFilters" });
  function Ve(t = {}, n = {}) {
    return {
      allowUrls: [...(t.allowUrls || []), ...(n.allowUrls || [])],
      denyUrls: [...(t.denyUrls || []), ...(n.denyUrls || [])],
      ignoreErrors: [
        ...(t.ignoreErrors || []),
        ...(n.ignoreErrors || []),
        ...(t.disableErrorDefaults ? [] : Xe),
      ],
      ignoreTransactions: [
        ...(t.ignoreTransactions || []),
        ...(n.ignoreTransactions || []),
      ],
    };
  }
  function Ze(t) {
    try {
      const n = [...(t.exception?.values ?? [])]
          .reverse()
          .find(
            (t) =>
              void 0 === t.mechanism?.parent_id && t.stacktrace?.frames?.length,
          ),
        e = n?.stacktrace?.frames;
      return e
        ? (function (t = []) {
            for (let n = t.length - 1; n >= 0; n--) {
              const e = t[n];
              if (
                e &&
                "<anonymous>" !== e.filename &&
                "[native code]" !== e.filename
              )
                return e.filename || null;
            }
            return null;
          })(e)
        : null;
    } catch {
      return null;
    }
  }
  function Qe(t, n, e, r, o, i) {
    if (!o.exception?.values || !i || !D(i.originalException, Error)) return;
    const s =
      o.exception.values.length > 0
        ? o.exception.values[o.exception.values.length - 1]
        : void 0;
    s &&
      (o.exception.values = tr(
        t,
        n,
        r,
        i.originalException,
        e,
        o.exception.values,
        s,
        0,
      ));
  }
  function tr(t, n, e, r, o, i, s, c) {
    if (i.length >= e + 1) return i;
    let u = [...i];
    if (D(r[o], Error)) {
      nr(s, c);
      const i = t(n, r[o]),
        a = u.length;
      (er(i, o, a, c), (u = tr(t, n, e, r[o], o, [i, ...u], i, a)));
    }
    return (
      Array.isArray(r.errors) &&
        r.errors.forEach((r, i) => {
          if (D(r, Error)) {
            nr(s, c);
            const a = t(n, r),
              f = u.length;
            (er(a, `errors[${i}]`, f, c),
              (u = tr(t, n, e, r, o, [a, ...u], a, f)));
          }
        }),
      u
    );
  }
  function nr(t, n) {
    t.mechanism = {
      handled: !0,
      type: "auto.core.linked_errors",
      ...t.mechanism,
      ...("AggregateError" === t.type && { is_exception_group: !0 }),
      exception_id: n,
    };
  }
  function er(t, n, e, r) {
    t.mechanism = {
      handled: !0,
      ...t.mechanism,
      type: "chained",
      source: n,
      exception_id: e,
      parent_id: r,
    };
  }
  function rr() {
    "console" in n &&
      s.forEach(function (t) {
        t in n.console &&
          z(n.console, t, function (e) {
            return (
              (c[t] = e),
              function (...e) {
                E("console", { args: e, level: t });
                const r = c[t];
                r?.apply(n.console, e);
              }
            );
          });
      });
  }
  function or(t) {
    return "warn" === t
      ? "warning"
      : ["fatal", "error", "warning", "log", "info", "debug"].includes(t)
        ? t
        : "log";
  }
  const ir = () => {
    let t;
    return {
      name: "Dedupe",
      processEvent(n) {
        if (n.type) return n;
        try {
          if (
            (function (t, n) {
              if (!n) return !1;
              if (
                (function (t, n) {
                  const e = t.message,
                    r = n.message;
                  if (!e && !r) return !1;
                  if ((e && !r) || (!e && r)) return !1;
                  if (e !== r) return !1;
                  if (!cr(t, n)) return !1;
                  if (!sr(t, n)) return !1;
                  return !0;
                })(t, n)
              )
                return !0;
              if (
                (function (t, n) {
                  const e = ur(n),
                    r = ur(t);
                  if (!e || !r) return !1;
                  if (e.type !== r.type || e.value !== r.value) return !1;
                  if (!cr(t, n)) return !1;
                  if (!sr(t, n)) return !1;
                  return !0;
                })(t, n)
              )
                return !0;
              return !1;
            })(n, t)
          )
            return null;
        } catch {}
        return (t = n);
      },
    };
  };
  function sr(t, n) {
    let e = y(t),
      r = y(n);
    if (!e && !r) return !0;
    if ((e && !r) || (!e && r)) return !1;
    if (r.length !== e.length) return !1;
    for (let t = 0; t < r.length; t++) {
      const n = r[t],
        o = e[t];
      if (
        n.filename !== o.filename ||
        n.lineno !== o.lineno ||
        n.colno !== o.colno ||
        n.function !== o.function
      )
        return !1;
    }
    return !0;
  }
  function cr(t, n) {
    let e = t.fingerprint,
      r = n.fingerprint;
    if (!e && !r) return !0;
    if ((e && !r) || (!e && r)) return !1;
    try {
      return !(e.join("") !== r.join(""));
    } catch {
      return !1;
    }
  }
  function ur(t) {
    return t.exception?.values?.[0];
  }
  function ar(t, n, e, r) {
    !(function (t, n) {
      const e = n?.scope ?? It(),
        r = n?.captureSerializedMetric ?? ge,
        o = e?.getClient() ?? Rt();
      if (!o) return;
      const {
        _experiments: i,
        enableMetrics: s,
        beforeSendMetric: c,
      } = o.getOptions();
      if (!(s ?? i?.enableMetrics ?? 1)) return;
      const u = ve(t, o, e);
      o.emit("processMetric", u);
      const a = c || i?.beforeSendMetric,
        f = a ? a(u) : u;
      if (!f) return;
      (r(o, be(f, o, e)), o.emit("afterCaptureMetric", f));
    })(
      { type: t, name: n, value: e, unit: r?.unit, attributes: r?.attributes },
      { scope: r?.scope },
    );
  }
  var fr = Object.freeze({
    __proto__: null,
    count: function (t, n = 1, e) {
      ar("counter", t, n, e);
    },
    distribution: function (t, n, e) {
      ar("distribution", t, n, e);
    },
    gauge: function (t, n, e) {
      ar("gauge", t, n, e);
    },
  });
  function lr(t) {
    return void 0 === t
      ? void 0
      : t >= 400 && t < 500
        ? "warning"
        : t >= 500
          ? "error"
          : void 0;
  }
  const dr = n;
  function hr(t) {
    return (
      t && /^function\s+\w+\(\)\s+\{\s+\[native code\]\s+\}$/.test(t.toString())
    );
  }
  function pr() {
    if ("string" == typeof EdgeRuntime) return !0;
    if (
      !(function () {
        if (!("fetch" in dr)) return !1;
        try {
          return (new Headers(), new Request("data:,"), new Response(), !0);
        } catch {
          return !1;
        }
      })()
    )
      return !1;
    if (hr(dr.fetch)) return !0;
    let t = !1;
    const n = dr.document;
    if (n && "function" == typeof n.createElement)
      try {
        const e = n.createElement("iframe");
        ((e.hidden = !0),
          n.head.appendChild(e),
          e.contentWindow?.fetch && (t = hr(e.contentWindow.fetch)),
          n.head.removeChild(e));
      } catch (t) {}
    return t;
  }
  function mr(t, e) {
    const r = "fetch";
    (_(r, t),
      w(r, () =>
        (function (t, e = !1) {
          if (e && !pr()) return;
          z(n, "fetch", function (t) {
            return function (...e) {
              const r = new Error(),
                { method: o, url: i } = (function (t) {
                  if (0 === t.length) return { method: "GET", url: "" };
                  if (2 === t.length) {
                    const [n, e] = t;
                    return {
                      url: gr(n),
                      method: yr(e, "method")
                        ? String(e.method).toUpperCase()
                        : B(n) && yr(n, "method")
                          ? String(n.method).toUpperCase()
                          : "GET",
                    };
                  }
                  const n = t[0];
                  return {
                    url: gr(n),
                    method: yr(n, "method")
                      ? String(n.method).toUpperCase()
                      : "GET",
                  };
                })(e),
                s = {
                  args: e,
                  fetchData: { method: o, url: i },
                  startTimestamp: 1e3 * lt(),
                  virtualError: r,
                  headers: vr(e),
                };
              return (
                E("fetch", { ...s }),
                t.apply(n, e).then(
                  async (t) => (
                    E("fetch", { ...s, endTimestamp: 1e3 * lt(), response: t }),
                    t
                  ),
                  (t) => {
                    if (
                      (E("fetch", { ...s, endTimestamp: 1e3 * lt(), error: t }),
                      j(t) &&
                        void 0 === t.stack &&
                        ((t.stack = r.stack), G(t, "framesToPop", 1)),
                      t instanceof TypeError &&
                        ("Failed to fetch" === t.message ||
                          "Load failed" === t.message ||
                          "NetworkError when attempting to fetch resource." ===
                            t.message))
                    )
                      try {
                        const n = new URL(s.fetchData.url);
                        t.message = `${t.message} (${n.host})`;
                      } catch {}
                    throw t;
                  },
                )
              );
            };
          });
        })(0, e),
      ));
  }
  function yr(t, n) {
    return !!t && "object" == typeof t && !!t[n];
  }
  function gr(t) {
    return "string" == typeof t
      ? t
      : t
        ? yr(t, "url")
          ? t.url
          : t.toString
            ? t.toString()
            : ""
        : "";
  }
  function vr(t) {
    const [n, e] = t;
    try {
      if ("object" == typeof e && null !== e && "headers" in e && e.headers)
        return new Headers(e.headers);
      if (B(n)) return new Headers(n.headers);
    } catch {}
  }
  const br = () => {},
    _r = ["attachTo", "createForm", "createWidget", "remove"],
    wr = Object.assign(
      (t) => (
        u(() => {
          console.warn(
            "You are using feedbackIntegration() even though this bundle does not include feedback.",
          );
        }),
        { name: "Feedback", ..._r.reduce((t, n) => ((t[n] = br), t), {}) }
      ),
      { _isShim: !0 },
    ),
    Er = ["start", "stop", "flush"];
  const Sr = (t) => (
      u(() => {
        console.warn(
          "You are using browserTracingIntegration() even though this bundle does not include tracing.",
        );
      }),
      { name: "BrowserTracing" }
    ),
    $r = n;
  let xr = 0;
  function kr() {
    return xr > 0;
  }
  function Ir(t, n = {}) {
    if (
      !(function (t) {
        return "function" == typeof t;
      })(t)
    )
      return t;
    try {
      const n = t.__sentry_wrapped__;
      if (n) return "function" == typeof n ? n : t;
      if (X(t)) return t;
    } catch {
      return t;
    }
    const sentryWrapped = function (...e) {
      try {
        const r = e.map((t) => Ir(t, n));
        return t.apply(this, r);
      } catch (t) {
        throw (
          xr++,
          setTimeout(() => {
            xr--;
          }),
          Ot((r) => {
            (r.addEventProcessor(
              (t) => (
                n.mechanism && (st(t, void 0), ct(t, n.mechanism)),
                (t.extra = { ...t.extra, arguments: e }),
                t
              ),
            ),
              captureException(t));
          }),
          t
        );
      }
    };
    try {
      for (const n in t)
        Object.prototype.hasOwnProperty.call(t, n) && (sentryWrapped[n] = t[n]);
    } catch {}
    (J(sentryWrapped, t), G(t, "__sentry_wrapped__", sentryWrapped));
    try {
      Object.getOwnPropertyDescriptor(sentryWrapped, "name").configurable &&
        Object.defineProperty(sentryWrapped, "name", { get: () => t.name });
    } catch {}
    return sentryWrapped;
  }
  function jr(t, n) {
    const e = Rr(t, n),
      r = { type: Ar(n), value: Pr(n) };
    return (
      e.length && (r.stacktrace = { frames: e }),
      void 0 === r.type &&
        "" === r.value &&
        (r.value = "Unrecoverable error caught"),
      r
    );
  }
  function Tr(t, n, e, r) {
    const o = Rt(),
      i = o?.getOptions().normalizeDepth,
      s = (function (t) {
        for (const n in t)
          if (Object.prototype.hasOwnProperty.call(t, n)) {
            const e = t[n];
            if (e instanceof Error) return e;
          }
        return;
      })(n),
      c = { __serialized__: xn(n, i) };
    if (s) return { exception: { values: [jr(t, s)] }, extra: c };
    const u = {
      exception: {
        values: [
          {
            type: L(n)
              ? n.constructor.name
              : r
                ? "UnhandledRejection"
                : "Error",
            value: Br(n, { isUnhandledRejection: r }),
          },
        ],
      },
      extra: c,
    };
    if (e) {
      const n = Rr(t, e);
      n.length && (u.exception.values[0].stacktrace = { frames: n });
    }
    return u;
  }
  function Or(t, n) {
    return { exception: { values: [jr(t, n)] } };
  }
  function Rr(t, n) {
    const e = n.stacktrace || n.stack || "",
      r = (function (t) {
        if (t && Cr.test(t.message)) return 1;
        return 0;
      })(n),
      o = (function (t) {
        if ("number" == typeof t.framesToPop) return t.framesToPop;
        return 0;
      })(n);
    try {
      return t(e, r, o);
    } catch {}
    return [];
  }
  const Cr = /Minified React error #\d+;/i;
  function Mr(t) {
    return (
      "undefined" != typeof WebAssembly &&
      void 0 !== WebAssembly.Exception &&
      t instanceof WebAssembly.Exception
    );
  }
  function Ar(t) {
    const n = t?.name;
    if (!n && Mr(t)) {
      return t.message && Array.isArray(t.message) && 2 == t.message.length
        ? t.message[0]
        : "WebAssembly.Exception";
    }
    return n;
  }
  function Pr(t) {
    const n = t?.message;
    return Mr(t)
      ? Array.isArray(t.message) && 2 == t.message.length
        ? t.message[1]
        : "wasm exception"
      : n
        ? n.error && "string" == typeof n.error.message
          ? n.error.message
          : n
        : "No error message";
  }
  function Lr(t, n, e, r) {
    const o = Dr(t, n, e?.syntheticException || void 0, r);
    return (
      ct(o),
      (o.level = "error"),
      e?.event_id && (o.event_id = e.event_id),
      Un(o)
    );
  }
  function Nr(t, n, e = "info", r, o) {
    const i = Ur(t, n, r?.syntheticException || void 0, o);
    return ((i.level = e), r?.event_id && (i.event_id = r.event_id), Un(i));
  }
  function Dr(t, n, e, r, o) {
    let i;
    if (O(n) && n.error) {
      return Or(t, n.error);
    }
    if (R(n) || T(n, "DOMException")) {
      const o = n;
      if ("stack" in n) i = Or(t, n);
      else {
        const n = o.name || (R(o) ? "DOMError" : "DOMException"),
          s = o.message ? `${n}: ${o.message}` : n;
        ((i = Ur(t, s, e, r)), st(i, s));
      }
      return (
        "code" in o &&
          (i.tags = { ...i.tags, "DOMException.code": `${o.code}` }),
        i
      );
    }
    if (j(n)) return Or(t, n);
    if (P(n) || L(n)) {
      return ((i = Tr(t, n, e, o)), ct(i, { synthetic: !0 }), i);
    }
    return ((i = Ur(t, n, e, r)), st(i, `${n}`), ct(i, { synthetic: !0 }), i);
  }
  function Ur(t, n, e, r) {
    const o = {};
    if (r && e) {
      const r = Rr(t, e);
      (r.length &&
        (o.exception = { values: [{ value: n, stacktrace: { frames: r } }] }),
        ct(o, { synthetic: !0 }));
    }
    if (M(n)) {
      const { __sentry_template_string__: t, __sentry_template_values__: e } =
        n;
      return ((o.logentry = { message: t, params: e }), o);
    }
    return ((o.message = n), o);
  }
  function Br(t, { isUnhandledRejection: n }) {
    const e = (function (t) {
        const n = Object.keys(Y(t));
        return (n.sort(), n[0] ? n.join(", ") : "[object has no keys]");
      })(t),
      r = n ? "promise rejection" : "exception";
    if (O(t))
      return `Event \`ErrorEvent\` captured as ${r} with message \`${t.message}\``;
    if (L(t)) {
      return `Event \`${(function (t) {
        try {
          const n = Object.getPrototypeOf(t);
          return n ? n.constructor.name : void 0;
        } catch {}
      })(t)}\` (type=${t.type}) captured as ${r}`;
    }
    return `Object captured as ${r} with keys: ${e}`;
  }
  class Fr extends Ce {
    constructor(t) {
      const n =
        ((r = t),
        {
          release:
            "string" == typeof __SENTRY_RELEASE__
              ? __SENTRY_RELEASE__
              : $r.SENTRY_RELEASE?.id,
          sendClientReports: !0,
          parentSpanIsAlwaysRootSpan: !0,
          ...r,
        });
      var r;
      (!(function (t, n, r = [n], o = "npm") {
        const i = t._metadata || {};
        (i.sdk ||
          (i.sdk = {
            name: `sentry.javascript.${n}`,
            packages: r.map((t) => ({ name: `${o}:@sentry/${t}`, version: e })),
            version: e,
          }),
          (t._metadata = i));
      })(n, "browser", ["browser"], $r.SENTRY_SDK_SOURCE || "cdn"),
        n._metadata?.sdk &&
          (n._metadata.sdk.settings = {
            infer_ip: n.sendDefaultPii ? "auto" : "never",
            ...n._metadata.sdk.settings,
          }),
        super(n));
      const {
          sendDefaultPii: o,
          sendClientReports: i,
          enableLogs: s,
          _experiments: c,
          enableMetrics: u,
        } = this.J,
        a = u ?? c?.enableMetrics ?? !0;
      ($r.document &&
        (i || s || a) &&
        $r.document.addEventListener("visibilitychange", () => {
          "hidden" === $r.document.visibilityState &&
            (i && this.lt(), s && he(this), a && _e(this));
        }),
        o && this.on("beforeSendSession", qe));
    }
    eventFromException(t, n) {
      return Lr(this.J.stackParser, t, n, this.J.attachStacktrace);
    }
    eventFromMessage(t, n = "info", e) {
      return Nr(this.J.stackParser, t, n, e, this.J.attachStacktrace);
    }
    ct(t, n, e, r) {
      return ((t.platform = t.platform || "javascript"), super.ct(t, n, e, r));
    }
  }
  const qr = n;
  let Hr, Wr, zr, Gr;
  function Jr() {
    if (!qr.document) return;
    const t = E.bind(null, "dom"),
      n = Xr(t, !0);
    (qr.document.addEventListener("click", n, !1),
      qr.document.addEventListener("keypress", n, !1),
      ["EventTarget", "Node"].forEach((n) => {
        const e = qr,
          r = e[n]?.prototype;
        r?.hasOwnProperty?.("addEventListener") &&
          (z(r, "addEventListener", function (n) {
            return function (e, r, o) {
              if ("click" === e || "keypress" == e)
                try {
                  const r = (this.__sentry_instrumentation_handlers__ =
                      this.__sentry_instrumentation_handlers__ || {}),
                    i = (r[e] = r[e] || { refCount: 0 });
                  if (!i.handler) {
                    const r = Xr(t);
                    ((i.handler = r), n.call(this, e, r, o));
                  }
                  i.refCount++;
                } catch {}
              return n.call(this, e, r, o);
            };
          }),
          z(r, "removeEventListener", function (t) {
            return function (n, e, r) {
              if ("click" === n || "keypress" == n)
                try {
                  const e = this.__sentry_instrumentation_handlers__ || {},
                    o = e[n];
                  o &&
                    (o.refCount--,
                    o.refCount <= 0 &&
                      (t.call(this, n, o.handler, r),
                      (o.handler = void 0),
                      delete e[n]),
                    0 === Object.keys(e).length &&
                      delete this.__sentry_instrumentation_handlers__);
                } catch {}
              return t.call(this, n, e, r);
            };
          }));
      }));
  }
  function Xr(t, n = !1) {
    return (e) => {
      if (!e || e._sentryCaptured) return;
      const r = (function (t) {
        try {
          return t.target;
        } catch {
          return null;
        }
      })(e);
      if (
        (function (t, n) {
          return (
            "keypress" === t &&
            (!n?.tagName ||
              ("INPUT" !== n.tagName &&
                "TEXTAREA" !== n.tagName &&
                !n.isContentEditable))
          );
        })(e.type, r)
      )
        return;
      (G(e, "_sentryCaptured", !0),
        r && !r._sentryId && G(r, "_sentryId", rt()));
      const o = "keypress" === e.type ? "input" : e.type;
      if (
        !(function (t) {
          if (t.type !== Wr) return !1;
          try {
            if (!t.target || t.target._sentryId !== zr) return !1;
          } catch {}
          return !0;
        })(e)
      ) {
        (t({ event: e, name: o, global: n }),
          (Wr = e.type),
          (zr = r ? r._sentryId : void 0));
      }
      (clearTimeout(Hr),
        (Hr = qr.setTimeout(() => {
          ((zr = void 0), (Wr = void 0));
        }, 1e3)));
    };
  }
  function Yr(t) {
    const n = "history";
    (_(n, t), w(n, Kr));
  }
  function Kr() {
    function t(t) {
      return function (...n) {
        const e = n.length > 2 ? n[2] : void 0;
        if (e) {
          const r = Gr,
            o = (function (t) {
              try {
                return new URL(t, qr.location.origin).toString();
              } catch {
                return t;
              }
            })(String(e));
          if (((Gr = o), r === o)) return t.apply(this, n);
          E("history", { from: r, to: o });
        }
        return t.apply(this, n);
      };
    }
    (qr.addEventListener("popstate", () => {
      const t = qr.location.href,
        n = Gr;
      if (((Gr = t), n === t)) return;
      E("history", { from: n, to: t });
    }),
      "history" in dr &&
        dr.history &&
        (z(qr.history, "pushState", t), z(qr.history, "replaceState", t)));
  }
  const Vr = {};
  function Zr(t) {
    const n = Vr[t];
    if (n) return n;
    let e = qr[t];
    if (hr(e)) return (Vr[t] = e.bind(qr));
    const r = qr.document;
    if (r && "function" == typeof r.createElement)
      try {
        const n = r.createElement("iframe");
        ((n.hidden = !0), r.head.appendChild(n));
        const o = n.contentWindow;
        (o?.[t] && (e = o[t]), r.head.removeChild(n));
      } catch (t) {}
    return e ? (Vr[t] = e.bind(qr)) : e;
  }
  const Qr = "__sentry_xhr_v3__";
  function to() {
    if (!qr.XMLHttpRequest) return;
    const t = XMLHttpRequest.prototype;
    ((t.open = new Proxy(t.open, {
      apply(t, n, e) {
        const r = new Error(),
          o = 1e3 * lt(),
          i = C(e[0]) ? e[0].toUpperCase() : void 0,
          s = (function (t) {
            if (C(t)) return t;
            try {
              return t.toString();
            } catch {}
            return;
          })(e[1]);
        if (!i || !s) return t.apply(n, e);
        ((n[Qr] = { method: i, url: s, request_headers: {} }),
          "POST" === i &&
            s.match(/sentry_key/) &&
            (n.__sentry_own_request__ = !0));
        const c = () => {
          const t = n[Qr];
          if (t && 4 === n.readyState) {
            try {
              t.status_code = n.status;
            } catch {}
            E("xhr", {
              endTimestamp: 1e3 * lt(),
              startTimestamp: o,
              xhr: n,
              virtualError: r,
            });
          }
        };
        return (
          "onreadystatechange" in n && "function" == typeof n.onreadystatechange
            ? (n.onreadystatechange = new Proxy(n.onreadystatechange, {
                apply: (t, n, e) => (c(), t.apply(n, e)),
              }))
            : n.addEventListener("readystatechange", c),
          (n.setRequestHeader = new Proxy(n.setRequestHeader, {
            apply(t, n, e) {
              const [r, o] = e,
                i = n[Qr];
              return (
                i && C(r) && C(o) && (i.request_headers[r.toLowerCase()] = o),
                t.apply(n, e)
              );
            },
          })),
          t.apply(n, e)
        );
      },
    })),
      (t.send = new Proxy(t.send, {
        apply(t, n, e) {
          const r = n[Qr];
          if (!r) return t.apply(n, e);
          void 0 !== e[0] && (r.body = e[0]);
          return (
            E("xhr", { startTimestamp: 1e3 * lt(), xhr: n }),
            t.apply(n, e)
          );
        },
      })));
  }
  function no(t, n = Zr("fetch")) {
    let e = 0,
      r = 0;
    return ke(
      t,
      async function (o) {
        const i = o.body.length;
        ((e += i), r++);
        const s = {
          body: o.body,
          method: "POST",
          referrerPolicy: "strict-origin",
          headers: t.headers,
          keepalive: e <= 6e4 && r < 15,
          ...t.fetchOptions,
        };
        try {
          const e = await n(t.url, s);
          return {
            statusCode: e.status,
            headers: {
              "x-sentry-rate-limits": e.headers.get("X-Sentry-Rate-Limits"),
              "retry-after": e.headers.get("Retry-After"),
            },
          };
        } catch (t) {
          throw ((Vr["fetch"] = void 0), t);
        } finally {
          ((e -= i), r--);
        }
      },
      $e(t.bufferSize || 40),
    );
  }
  const eo = {
    startProfiler: function () {
      const t = Rt();
      if (!t) return;
      t.getIntegrationByName("BrowserProfiling") && t.emit("startUIProfiler");
    },
    stopProfiler: function () {
      const t = Rt();
      if (!t) return;
      t.getIntegrationByName("BrowserProfiling") && t.emit("stopUIProfiler");
    },
  };
  function ro(t, n, e, r) {
    const o = {
      filename: t,
      function: "<anonymous>" === n ? a : n,
      in_app: !0,
    };
    return (void 0 !== e && (o.lineno = e), void 0 !== r && (o.colno = r), o);
  }
  const oo = /^\s*at (\S+?)(?::(\d+))(?::(\d+))\s*$/i,
    io =
      /^\s*at (?:(.+?\)(?: \[.+\])?|.*?) ?\((?:address at )?)?(?:async )?((?:<anonymous>|[-a-z]+:|.*bundle|\/)?.*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i,
    so = /\((\S*)(?::(\d+))(?::(\d+))\)/,
    co = /at (.+?) ?\(data:(.+?),/,
    uo = [
      30,
      (t) => {
        const n = t.match(co);
        if (n) return { filename: `<data:${n[2]}>`, function: n[1] };
        const e = oo.exec(t);
        if (e) {
          const [, t, n, r] = e;
          return ro(t, a, +n, +r);
        }
        const r = io.exec(t);
        if (r) {
          if (r[2] && 0 === r[2].indexOf("eval")) {
            const t = so.exec(r[2]);
            t && ((r[2] = t[1]), (r[3] = t[2]), (r[4] = t[3]));
          }
          const [t, n] = wo(r[1] || a, r[2]);
          return ro(n, t, r[3] ? +r[3] : void 0, r[4] ? +r[4] : void 0);
        }
      },
    ],
    ao =
      /^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:[-a-z]+)?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i,
    fo = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i,
    lo = [
      50,
      (t) => {
        const n = ao.exec(t);
        if (n) {
          if (n[3] && n[3].indexOf(" > eval") > -1) {
            const t = fo.exec(n[3]);
            t &&
              ((n[1] = n[1] || "eval"),
              (n[3] = t[1]),
              (n[4] = t[2]),
              (n[5] = ""));
          }
          let t = n[3],
            e = n[1] || a;
          return (
            ([e, t] = wo(e, t)),
            ro(t, e, n[4] ? +n[4] : void 0, n[5] ? +n[5] : void 0)
          );
        }
      },
    ],
    ho =
      /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:[-a-z]+):.*?):(\d+)(?::(\d+))?\)?\s*$/i,
    po = [
      40,
      (t) => {
        const n = ho.exec(t);
        return n ? ro(n[2], n[1] || a, +n[3], n[4] ? +n[4] : void 0) : void 0;
      },
    ],
    mo = / line (\d+).*script (?:in )?(\S+)(?:: in function (\S+))?$/i,
    yo = [
      10,
      (t) => {
        const n = mo.exec(t);
        return n ? ro(n[2], n[3] || a, +n[1]) : void 0;
      },
    ],
    go =
      / line (\d+), column (\d+)\s*(?:in (?:<anonymous function: ([^>]+)>|([^)]+))\(.*\))? in (.*):\s*$/i,
    vo = [
      20,
      (t) => {
        const n = go.exec(t);
        return n ? ro(n[5], n[3] || n[4] || a, +n[1], +n[2]) : void 0;
      },
    ],
    bo = [uo, lo],
    _o = d(...bo),
    wo = (t, n) => {
      const e = -1 !== t.indexOf("safari-extension"),
        r = -1 !== t.indexOf("safari-web-extension");
      return e || r
        ? [
            -1 !== t.indexOf("@") ? t.split("@")[0] : a,
            e ? `safari-extension:${n}` : `safari-web-extension:${n}`,
          ]
        : [t, n];
    };
  const Eo = 1024,
    So = (t = {}) => {
      const n = {
        console: !0,
        dom: !0,
        fetch: !0,
        history: !0,
        sentry: !0,
        xhr: !0,
        ...t,
      };
      return {
        name: "Breadcrumbs",
        setup(t) {
          var e;
          (n.console &&
            (function (t) {
              const n = "console";
              (_(n, t), w(n, rr));
            })(
              (function (t) {
                return function (n) {
                  if (Rt() !== t) return;
                  const e = {
                    category: "console",
                    data: { arguments: n.args, logger: "console" },
                    level: or(n.level),
                    message: Q(n.args, " "),
                  };
                  if ("assert" === n.level) {
                    if (!1 !== n.args[0]) return;
                    ((e.message = `Assertion failed: ${Q(n.args.slice(1), " ") || "console.assert"}`),
                      (e.data.arguments = n.args.slice(1)));
                  }
                  We(e, { input: n.args, level: n.level });
                };
              })(t),
            ),
            n.dom &&
              ((e = (function (t, n) {
                return function (e) {
                  if (Rt() !== t) return;
                  let r,
                    o,
                    i = "object" == typeof n ? n.serializeAttribute : void 0,
                    s =
                      "object" == typeof n &&
                      "number" == typeof n.maxStringLength
                        ? n.maxStringLength
                        : void 0;
                  (s && s > Eo && (s = Eo), "string" == typeof i && (i = [i]));
                  try {
                    const t = e.event,
                      n = (function (t) {
                        return !!t && !!t.target;
                      })(t)
                        ? t.target
                        : t;
                    ((r = q(n, { keyAttrs: i, maxStringLength: s })),
                      (o = (function (t) {
                        if (!F.HTMLElement) return null;
                        let n = t;
                        for (let t = 0; t < 5; t++) {
                          if (!n) return null;
                          if (n instanceof HTMLElement) {
                            if (n.dataset.sentryComponent)
                              return n.dataset.sentryComponent;
                            if (n.dataset.sentryElement)
                              return n.dataset.sentryElement;
                          }
                          n = n.parentNode;
                        }
                        return null;
                      })(n)));
                  } catch {
                    r = "<unknown>";
                  }
                  if (0 === r.length) return;
                  const c = { category: `ui.${e.name}`, message: r };
                  (o && (c.data = { "ui.component_name": o }),
                    We(c, { event: e.event, name: e.name, global: e.global }));
                };
              })(t, n.dom)),
              _("dom", e),
              w("dom", Jr)),
            n.xhr &&
              (function (t) {
                (_("xhr", t), w("xhr", to));
              })(
                (function (t) {
                  return function (n) {
                    if (Rt() !== t) return;
                    const { startTimestamp: e, endTimestamp: r } = n,
                      o = n.xhr[Qr];
                    if (!e || !r || !o) return;
                    const { method: i, url: s, status_code: c, body: u } = o,
                      a = { method: i, url: s, status_code: c },
                      f = {
                        xhr: n.xhr,
                        input: u,
                        startTimestamp: e,
                        endTimestamp: r,
                      },
                      l = {
                        category: "xhr",
                        data: a,
                        type: "http",
                        level: lr(c),
                      };
                    (t.emit("beforeOutgoingRequestBreadcrumb", l, f), We(l, f));
                  };
                })(t),
              ),
            n.fetch &&
              mr(
                (function (t) {
                  return function (n) {
                    if (Rt() !== t) return;
                    const { startTimestamp: e, endTimestamp: r } = n;
                    if (
                      r &&
                      (!n.fetchData.url.match(/sentry_key/) ||
                        "POST" !== n.fetchData.method)
                    )
                      if (n.error) {
                        const o = n.fetchData,
                          i = {
                            data: n.error,
                            input: n.args,
                            startTimestamp: e,
                            endTimestamp: r,
                          },
                          s = {
                            category: "fetch",
                            data: o,
                            level: "error",
                            type: "http",
                          };
                        (t.emit("beforeOutgoingRequestBreadcrumb", s, i),
                          We(s, i));
                      } else {
                        const o = n.response,
                          i = { ...n.fetchData, status_code: o?.status },
                          s = {
                            input: n.args,
                            response: o,
                            startTimestamp: e,
                            endTimestamp: r,
                          },
                          c = {
                            category: "fetch",
                            data: i,
                            type: "http",
                            level: lr(i.status_code),
                          };
                        (t.emit("beforeOutgoingRequestBreadcrumb", c, s),
                          We(c, s));
                      }
                  };
                })(t),
              ),
            n.history &&
              Yr(
                (function (t) {
                  return function (n) {
                    if (Rt() !== t) return;
                    let e = n.from,
                      r = n.to;
                    const o = Fe($r.location.href);
                    let i = e ? Fe(e) : void 0;
                    const s = Fe(r);
                    (i?.path || (i = o),
                      o.protocol === s.protocol &&
                        o.host === s.host &&
                        (r = s.relative),
                      o.protocol === i.protocol &&
                        o.host === i.host &&
                        (e = i.relative),
                      We({ category: "navigation", data: { from: e, to: r } }));
                  };
                })(t),
              ),
            n.sentry &&
              t.on(
                "beforeSendEvent",
                (function (t) {
                  return function (n) {
                    Rt() === t &&
                      We(
                        {
                          category:
                            "sentry." +
                            ("transaction" === n.type
                              ? "transaction"
                              : "event"),
                          event_id: n.event_id,
                          level: n.level,
                          message: it(n),
                        },
                        { event: n },
                      );
                  };
                })(t),
              ));
        },
      };
    };
  const $o = [
      "EventTarget",
      "Window",
      "Node",
      "ApplicationCache",
      "AudioTrackList",
      "BroadcastChannel",
      "ChannelMergerNode",
      "CryptoOperation",
      "EventSource",
      "FileReader",
      "HTMLUnknownElement",
      "IDBDatabase",
      "IDBRequest",
      "IDBTransaction",
      "KeyOperation",
      "MediaController",
      "MessagePort",
      "ModalWindow",
      "Notification",
      "SVGElementInstance",
      "Screen",
      "SharedWorker",
      "TextTrack",
      "TextTrackCue",
      "TextTrackList",
      "WebSocket",
      "WebSocketWorker",
      "Worker",
      "XMLHttpRequest",
      "XMLHttpRequestEventTarget",
      "XMLHttpRequestUpload",
    ],
    xo = (t = {}) => {
      const n = {
        XMLHttpRequest: !0,
        eventTarget: !0,
        requestAnimationFrame: !0,
        setInterval: !0,
        setTimeout: !0,
        unregisterOriginalCallbacks: !1,
        ...t,
      };
      return {
        name: "BrowserApiErrors",
        setupOnce() {
          (n.setTimeout && z($r, "setTimeout", ko),
            n.setInterval && z($r, "setInterval", ko),
            n.requestAnimationFrame && z($r, "requestAnimationFrame", Io),
            n.XMLHttpRequest &&
              "XMLHttpRequest" in $r &&
              z(XMLHttpRequest.prototype, "send", jo));
          const t = n.eventTarget;
          if (t) {
            (Array.isArray(t) ? t : $o).forEach((t) =>
              (function (t, n) {
                const e = $r,
                  r = e[t]?.prototype;
                if (!r?.hasOwnProperty?.("addEventListener")) return;
                (z(r, "addEventListener", function (e) {
                  return function (r, o, i) {
                    try {
                      "function" == typeof o.handleEvent &&
                        (o.handleEvent = Ir(o.handleEvent, {
                          mechanism: {
                            data: { handler: m(o), target: t },
                            handled: !1,
                            type: "auto.browser.browserapierrors.handleEvent",
                          },
                        }));
                    } catch {}
                    return (
                      n.unregisterOriginalCallbacks &&
                        (function (t, n, e) {
                          t &&
                            "object" == typeof t &&
                            "removeEventListener" in t &&
                            "function" == typeof t.removeEventListener &&
                            t.removeEventListener(n, e);
                        })(this, r, o),
                      e.apply(this, [
                        r,
                        Ir(o, {
                          mechanism: {
                            data: { handler: m(o), target: t },
                            handled: !1,
                            type: "auto.browser.browserapierrors.addEventListener",
                          },
                        }),
                        i,
                      ])
                    );
                  };
                }),
                  z(r, "removeEventListener", function (t) {
                    return function (n, e, r) {
                      try {
                        const o = e.__sentry_wrapped__;
                        o && t.call(this, n, o, r);
                      } catch {}
                      return t.call(this, n, e, r);
                    };
                  }));
              })(t, n),
            );
          }
        },
      };
    };
  function ko(t) {
    return function (...n) {
      const e = n[0];
      return (
        (n[0] = Ir(e, {
          mechanism: {
            handled: !1,
            type: `auto.browser.browserapierrors.${m(t)}`,
          },
        })),
        t.apply(this, n)
      );
    };
  }
  function Io(t) {
    return function (n) {
      return t.apply(this, [
        Ir(n, {
          mechanism: {
            data: { handler: m(t) },
            handled: !1,
            type: "auto.browser.browserapierrors.requestAnimationFrame",
          },
        }),
      ]);
    };
  }
  function jo(t) {
    return function (...n) {
      const e = this;
      return (
        ["onload", "onerror", "onprogress", "onreadystatechange"].forEach(
          (t) => {
            t in e &&
              "function" == typeof e[t] &&
              z(e, t, function (n) {
                const e = {
                    mechanism: {
                      data: { handler: m(n) },
                      handled: !1,
                      type: `auto.browser.browserapierrors.xhr.${t}`,
                    },
                  },
                  r = X(n);
                return (r && (e.mechanism.data.handler = m(r)), Ir(n, e));
              });
          },
        ),
        t.apply(this, n)
      );
    };
  }
  const To = () => ({
      name: "BrowserSession",
      setupOnce() {
        void 0 !== $r.document &&
          (re({ ignoreDuration: !0 }),
          se(),
          Yr(({ from: t, to: n }) => {
            void 0 !== t && t !== n && (re({ ignoreDuration: !0 }), se());
          }));
      },
    }),
    Oo = (t = {}) => {
      const n = { onerror: !0, onunhandledrejection: !0, ...t };
      return {
        name: "GlobalHandlers",
        setupOnce() {
          Error.stackTraceLimit = 50;
        },
        setup(t) {
          (n.onerror &&
            (function (t) {
              !(function (t) {
                const n = "error";
                (_(n, t), w(n, $));
              })((n) => {
                const { stackParser: e, attachStacktrace: r } = Ro();
                if (Rt() !== t || kr()) return;
                const { msg: o, url: i, line: s, column: c, error: u } = n,
                  f = (function (t, n, e, r) {
                    const o = (t.exception = t.exception || {}),
                      i = (o.values = o.values || []),
                      s = (i[0] = i[0] || {}),
                      c = (s.stacktrace = s.stacktrace || {}),
                      u = (c.frames = c.frames || []),
                      f = r,
                      l = e,
                      d =
                        (function (t) {
                          if (!C(t) || 0 === t.length) return;
                          if (t.startsWith("data:")) {
                            const n = t.match(/^data:([^;]+)/);
                            return `<data:${n ? n[1] : "text/javascript"}${t.includes("base64,") ? ",base64" : ""}>`;
                          }
                          return t;
                        })(n) ?? W();
                    0 === u.length &&
                      u.push({
                        colno: f,
                        filename: d,
                        function: a,
                        in_app: !0,
                        lineno: l,
                      });
                    return t;
                  })(Dr(e, u || o, void 0, r, !1), i, s, c);
                ((f.level = "error"),
                  te(f, {
                    originalException: u,
                    mechanism: {
                      handled: !1,
                      type: "auto.browser.global_handlers.onerror",
                    },
                  }));
              });
            })(t),
            n.onunhandledrejection &&
              (function (t) {
                !(function (t) {
                  const n = "unhandledrejection";
                  (_(n, t), w(n, k));
                })((n) => {
                  const { stackParser: e, attachStacktrace: r } = Ro();
                  if (Rt() !== t || kr()) return;
                  const o = (function (t) {
                      if (A(t)) return t;
                      try {
                        if ("reason" in t) return t.reason;
                        if ("detail" in t && "reason" in t.detail)
                          return t.detail.reason;
                      } catch {}
                      return t;
                    })(n),
                    i = A(o)
                      ? {
                          exception: {
                            values: [
                              {
                                type: "UnhandledRejection",
                                value: `Non-Error promise rejection captured with value: ${String(o)}`,
                              },
                            ],
                          },
                        }
                      : Dr(e, o, void 0, r, !0);
                  ((i.level = "error"),
                    te(i, {
                      originalException: o,
                      mechanism: {
                        handled: !1,
                        type: "auto.browser.global_handlers.onunhandledrejection",
                      },
                    }));
                });
              })(t));
        },
      };
    };
  function Ro() {
    const t = Rt();
    return t?.getOptions() || { stackParser: () => [], attachStacktrace: !1 };
  }
  const Co = () => ({
      name: "HttpContext",
      preprocessEvent(t) {
        if (!$r.navigator && !$r.location && !$r.document) return;
        const n = (function () {
            const t = W(),
              { referrer: n } = $r.document || {},
              { userAgent: e } = $r.navigator || {};
            return {
              url: t,
              headers: {
                ...(n && { Referer: n }),
                ...(e && { "User-Agent": e }),
              },
            };
          })(),
          e = { ...n.headers, ...t.request?.headers };
        t.request = { ...n, ...t.request, headers: e };
      },
    }),
    Mo = (t = {}) => {
      const n = t.limit || 5,
        e = t.key || "cause";
      return {
        name: "LinkedErrors",
        preprocessEvent(t, r, o) {
          Qe(jr, o.getOptions().stackParser, e, n, t, r);
        },
      };
    };
  function Ao() {
    return !!(function () {
      if (void 0 === $r.window) return !1;
      const t = $r;
      if (t.nw) return !1;
      const n = t.chrome || t.browser;
      if (!n?.runtime?.id) return !1;
      const e = W(),
        r = [
          "chrome-extension",
          "moz-extension",
          "ms-browser-extension",
          "safari-web-extension",
        ];
      return !($r === $r.top && r.some((t) => e.startsWith(`${t}://`)));
    })();
  }
  function Po(t) {
    return [Ke(), Je(), xo(), So(), Oo(), Mo(), ir(), Co(), To()];
  }
  const Lo = {
      replayIntegration: "replay",
      replayCanvasIntegration: "replay-canvas",
      feedbackIntegration: "feedback",
      feedbackModalIntegration: "feedback-modal",
      feedbackScreenshotIntegration: "feedback-screenshot",
      captureConsoleIntegration: "captureconsole",
      contextLinesIntegration: "contextlines",
      linkedErrorsIntegration: "linkederrors",
      dedupeIntegration: "dedupe",
      extraErrorDataIntegration: "extraerrordata",
      graphqlClientIntegration: "graphqlclient",
      httpClientIntegration: "httpclient",
      reportingObserverIntegration: "reportingobserver",
      rewriteFramesIntegration: "rewriteframes",
      browserProfilingIntegration: "browserprofiling",
      moduleMetadataIntegration: "modulemetadata",
      instrumentAnthropicAiClient: "instrumentanthropicaiclient",
      instrumentOpenAiClient: "instrumentopenaiclient",
      instrumentGoogleGenAIClient: "instrumentgooglegenaiclient",
      instrumentLangGraph: "instrumentlanggraph",
      createLangChainCallbackHandler: "createlangchaincallbackhandler",
    },
    No = $r;
  return (
    (t.BrowserClient = Fr),
    (t.SDK_VERSION = e),
    (t.SEMANTIC_ATTRIBUTE_SENTRY_OP = Pt),
    (t.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN = Lt),
    (t.SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE = At),
    (t.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE = Mt),
    (t.Scope = _t),
    (t.WINDOW = $r),
    (t.addBreadcrumb = We),
    (t.addEventProcessor = function (t) {
      jt().addEventProcessor(t);
    }),
    (t.addIntegration = function (t) {
      const n = Rt();
      n && n.addIntegration(t);
    }),
    (t.breadcrumbsIntegration = So),
    (t.browserApiErrorsIntegration = xo),
    (t.browserTracingIntegration = Sr),
    (t.captureEvent = te),
    (t.captureException = captureException),
    (t.captureFeedback = function (t, n = {}, e = It()) {
      const {
          message: r,
          name: o,
          email: i,
          url: s,
          source: c,
          associatedEventId: u,
          tags: a,
        } = t,
        f = {
          contexts: {
            feedback: {
              contact_email: i,
              name: o,
              message: r,
              url: s,
              source: c,
              associated_event_id: u,
            },
          },
          type: "feedback",
          level: "info",
          tags: a,
        },
        l = e?.getClient() || Rt();
      return (l && l.emit("beforeSendFeedback", f, n), e.captureEvent(f, n));
    }),
    (t.captureMessage = function (t, n) {
      const e = "string" == typeof n ? n : void 0,
        r = "string" != typeof n ? { captureContext: n } : void 0;
      return It().captureMessage(t, e, r);
    }),
    (t.captureSession = se),
    (t.chromeStackLineParser = uo),
    (t.close = async function (t) {
      const n = Rt();
      return n ? n.close(t) : Promise.resolve(!1);
    }),
    (t.continueTrace = (t, n) => {
      const e = kt(r());
      if (e.continueTrace) return e.continueTrace(t, n);
      const { sentryTrace: o, baggage: i } = t,
        s = Rt(),
        c = Wt(i);
      return s &&
        !(function (t, n) {
          const e = Vt(t);
          return (
            (!n || !e || n === e) &&
            (!t.getOptions().strictTraceContinuation ||
              !((n && !e) || (!n && e)))
          );
        })(s, c?.org_id)
        ? (function (t) {
            return Ot(
              (n) => (
                n.setPropagationContext({
                  traceId: mt(),
                  sampleRand: Math.random(),
                }),
                (function (t, n) {
                  const e = Dn();
                  if (e.withActiveSpan) return e.withActiveSpan(t, n);
                  return Ot((t) => (vt(t, void 0), n(t)));
                })(null, t)
              ),
            );
          })(n)
        : Ot((t) => {
            const e = nn(o, i);
            return (t.setPropagationContext(e), vt(t, void 0), n());
          });
    }),
    (t.createTransport = ke),
    (t.createUserFeedbackEnvelope = function (
      t,
      { metadata: n, tunnel: e, dsn: r },
    ) {
      const o = {
          event_id: t.event_id,
          sent_at: new Date().toISOString(),
          ...(n?.sdk && { sdk: { name: n.sdk.name, version: n.sdk.version } }),
          ...(!!e && !!r && { dsn: Yt(r) }),
        },
        i = (function (t) {
          return [{ type: "user_report" }, t];
        })(t);
      return In(o, [i]);
    }),
    (t.dedupeIntegration = ir),
    (t.defaultStackLineParsers = bo),
    (t.defaultStackParser = _o),
    (t.endSession = oe),
    (t.eventFiltersIntegration = Ye),
    (t.eventFromException = Lr),
    (t.eventFromMessage = Nr),
    (t.exceptionFromError = jr),
    (t.feedbackAsyncIntegration = wr),
    (t.feedbackIntegration = wr),
    (t.flush = async function (t) {
      const n = Rt();
      return n ? n.flush(t) : Promise.resolve(!1);
    }),
    (t.forceLoad = function () {}),
    (t.functionToStringIntegration = Je),
    (t.geckoStackLineParser = lo),
    (t.getClient = Rt),
    (t.getCurrentScope = It),
    (t.getDefaultIntegrations = Po),
    (t.getGlobalScope = Tt),
    (t.getIsolationScope = jt),
    (t.getTraceData = function (t = {}) {
      const n = t.client || Rt();
      if (!ee() || !n) return {};
      const e = kt(r());
      if (e.getTraceData) return e.getTraceData(t);
      const o = t.scope || It(),
        i = t.span || mn(),
        s = i
          ? cn(i)
          : (function (t) {
              const {
                traceId: n,
                sampled: e,
                propagationSpanId: r,
              } = t.getPropagationContext();
              return en(n, r, e);
            })(o),
        c = zt(i ? Sn(i) : En(n, o));
      if (!tn.test(s)) return {};
      const u = { "sentry-trace": s, baggage: c };
      if (t.propagateTraceparent) {
        const t = i
          ? (function (t) {
              const { traceId: n, spanId: e } = t.spanContext();
              return rn(n, e, dn(t));
            })(i)
          : (function (t) {
              const {
                traceId: n,
                sampled: e,
                propagationSpanId: r,
              } = t.getPropagationContext();
              return rn(n, r, e);
            })(o);
        t && (u.traceparent = t);
      }
      return u;
    }),
    (t.globalHandlersIntegration = Oo),
    (t.httpContextIntegration = Co),
    (t.inboundFiltersIntegration = Ke),
    (t.init = function (t = {}) {
      const n = !t.skipBrowserExtensionCheck && Ao();
      let e = null == t.defaultIntegrations ? Po() : t.defaultIntegrations;
      const r = {
        ...t,
        enabled: !n && t.enabled,
        stackParser:
          ((o = t.stackParser || _o), Array.isArray(o) ? d(...o) : o),
        integrations: fe({
          integrations: t.integrations,
          defaultIntegrations: e,
        }),
        transport: t.transport || no,
      };
      var o;
      return (function (t, n) {
        (!0 === n.debug &&
          u(() => {
            console.warn(
              "[Sentry] Cannot initialize SDK with `debug` option using a non-debug bundle.",
            );
          }),
          It().update(n.initialScope));
        const e = new t(n);
        return (Be(e), e.init(), e);
      })(Fr, r);
    }),
    (t.isEnabled = ee),
    (t.isInitialized = function () {
      return !!Rt();
    }),
    (t.lastEventId = ne),
    (t.lazyLoadIntegration = async function (t, n) {
      const r = Lo[t],
        o = (No.Sentry = No.Sentry || {});
      if (!r) throw new Error(`Cannot lazy load integration: ${t}`);
      const i = o[t];
      if ("function" == typeof i && !("_isShim" in i)) return i;
      const s = (function (t) {
          const n = Rt(),
            r = n?.getOptions()?.cdnBaseUrl || "https://browser.sentry-cdn.com";
          return new URL(`/${e}/${t}.min.js`, r).toString();
        })(r),
        c = $r.document.createElement("script");
      ((c.src = s),
        (c.crossOrigin = "anonymous"),
        (c.referrerPolicy = "strict-origin"),
        n && c.setAttribute("nonce", n));
      const u = new Promise((t, n) => {
          (c.addEventListener("load", () => t()),
            c.addEventListener("error", n));
        }),
        a = $r.document.currentScript,
        f = $r.document.body || $r.document.head || a?.parentElement;
      if (!f)
        throw new Error(
          `Could not find parent element to insert lazy-loaded ${t} script`,
        );
      f.appendChild(c);
      try {
        await u;
      } catch {
        throw new Error(`Error when loading integration: ${t}`);
      }
      const l = o[t];
      if ("function" != typeof l)
        throw new Error(`Could not load integration: ${t}`);
      return l;
    }),
    (t.linkedErrorsIntegration = Mo),
    (t.makeFetchTransport = no),
    (t.metrics = fr),
    (t.onLoad = function (t) {
      t();
    }),
    (t.opera10StackLineParser = yo),
    (t.opera11StackLineParser = vo),
    (t.parameterize = function (t, ...n) {
      const e = new String(String.raw(t, ...n));
      return (
        (e.__sentry_template_string__ = t
          .join("\0")
          .replace(/%/g, "%%")
          .replace(/\0/g, "%s")),
        (e.__sentry_template_values__ = n),
        e
      );
    }),
    (t.replayIntegration = function (t) {
      return (
        u(() => {
          console.warn(
            "You are using replayIntegration() even though this bundle does not include replay.",
          );
        }),
        { name: "Replay", ...Er.reduce((t, n) => ((t[n] = br), t), {}) }
      );
    }),
    (t.setContext = function (t, n) {
      jt().setContext(t, n);
    }),
    (t.setCurrentClient = Be),
    (t.setExtra = function (t, n) {
      jt().setExtra(t, n);
    }),
    (t.setExtras = function (t) {
      jt().setExtras(t);
    }),
    (t.setTag = function (t, n) {
      jt().setTag(t, n);
    }),
    (t.setTags = function (t) {
      jt().setTags(t);
    }),
    (t.setUser = function (t) {
      jt().setUser(t);
    }),
    (t.showReportDialog = function (t = {}) {
      const n = $r.document,
        e = n?.head || n?.body;
      if (!e) return;
      const r = It(),
        o = Rt(),
        i = o?.getDsn();
      if (!i) return;
      const s = {
          ...t,
          user: { ...r.getUser(), ...t.user },
          eventId: t.eventId || ne(),
        },
        c = $r.document.createElement("script");
      ((c.async = !0),
        (c.crossOrigin = "anonymous"),
        (c.src = (function (t, n) {
          const e = Zt(t);
          if (!e) return "";
          const r = `${ce(e)}embed/error-page/`;
          let o = `dsn=${Yt(e)}`;
          for (const t in n)
            if ("dsn" !== t && "onClose" !== t)
              if ("user" === t) {
                const t = n.user;
                if (!t) continue;
                (t.name && (o += `&name=${encodeURIComponent(t.name)}`),
                  t.email && (o += `&email=${encodeURIComponent(t.email)}`));
              } else
                o += `&${encodeURIComponent(t)}=${encodeURIComponent(n[t])}`;
          return `${r}?${o}`;
        })(i, s)));
      const { onLoad: u, onClose: a } = s;
      if ((u && (c.onload = u), a)) {
        const t = (n) => {
          if ("__sentry_reportdialog_closed__" === n.data)
            try {
              a();
            } finally {
              $r.removeEventListener("message", t);
            }
        };
        $r.addEventListener("message", t);
      }
      e.appendChild(c);
    }),
    (t.spanToBaggageHeader = function (t) {
      return zt(Sn(t));
    }),
    (t.spanToJSON = ln),
    (t.spanToTraceHeader = cn),
    (t.startSession = re),
    (t.suppressTracing = function (t) {
      const n = Dn();
      return n.suppressTracing
        ? n.suppressTracing(t)
        : Ot((n) => {
            n.setSDKProcessingMetadata({ [Nn]: !0 });
            const e = t();
            return (n.setSDKProcessingMetadata({ [Nn]: void 0 }), e);
          });
    }),
    (t.uiProfiler = eo),
    (t.updateSpanName = function (t, n) {
      (t.updateName(n), t.setAttributes({ [Mt]: "custom", [Nt]: n }));
    }),
    (t.winjsStackLineParser = po),
    (t.withIsolationScope = function (...t) {
      const n = kt(r());
      if (2 === t.length) {
        const [e, r] = t;
        return e ? n.withSetIsolationScope(e, r) : n.withIsolationScope(r);
      }
      return n.withIsolationScope(t[0]);
    }),
    (t.withScope = Ot),
    t
  );
})({});
//# sourceMappingURL=bundle.min.js.map
