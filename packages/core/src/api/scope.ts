/* eslint-disable max-lines */
import type { Context, Contexts } from "@/types/scope";
import type { Extra, Extras } from "@/types/scope";
import type { Primitive } from "@/types/scope";
import type { User } from "@/types/scope";

/**
 * A context to be used for capturing an event.
 * This can either be a Scope, or a partial ScopeContext,
 * or a callback that receives the current scope and returns a new scope to use.
 */
export type CaptureContext =
  | Scope
  | Partial<ScopeContext>
  | ((scope: Scope) => Scope);

/**
 * Data that can be converted to a Scope.
 */
export interface ScopeContext {
  user: User;
  extra: Extras;
  contexts: Contexts;
  tags: { [key: string]: Primitive };
  fingerprint: string[];
}

export interface SdkProcessingMetadata {
  [key: string]: unknown;
  requestSession?: {
    status: "ok" | "errored" | "crashed";
  };
  capturedSpanScope?: Scope;
  capturedSpanIsolationScope?: Scope;
  spanCountBeforeProcessing?: number;
  ipAddress?: string;
}

/**
 * Normalized data of the Scope, ready to be used.
 */
export interface ScopeData {
  user: User;
  tags: { [key: string]: Primitive };
  extra: Extras;
  contexts: Contexts;
  sdkProcessingMetadata: SdkProcessingMetadata;
  fingerprint: string[];
  transactionName?: string;
}

/**
 * Holds additional event information.
 */
export class Scope {
  /** Flag if notifying is happening. */
  protected _notifyingListeners: boolean;

  /** Callback for client to receive scope changes. */
  protected _scopeListeners: Array<(scope: Scope) => void>;

  /** User */
  protected _user: User;

  /** Tags */
  protected _tags: { [key: string]: Primitive };

  /** Extra */
  protected _extra: Extras;

  /** Contexts */
  protected _contexts: Contexts;

  /**
   * A place to stash data which is needed at some point in the SDK's event processing pipeline but which shouldn't get
   * sent to Sentry
   */
  protected _sdkProcessingMetadata: SdkProcessingMetadata;

  /** Fingerprint */
  protected _fingerprint?: string[];

  /**
   * Transaction Name
   *
   * IMPORTANT: The transaction name on the scope has nothing to do with root spans/transaction objects.
   * It's purpose is to assign a transaction to the scope that's added to non-transaction events.
   */
  protected _transactionName?: string;

  /** Contains the last event id of a captured event.  */
  protected _lastEventId?: string;

  // NOTE: Any field which gets added here should get added not only to the constructor but also to the `clone` method.

  public constructor() {
    this._notifyingListeners = false;
    this._scopeListeners = [];
    this._user = {};
    this._tags = {};
    this._extra = {};
    this._contexts = {};
    this._sdkProcessingMetadata = {};
  }

  /**
   * Clone all data from this scope into a new scope.
   */
  public clone(): Scope {
    const newScope = new Scope();
    newScope._tags = { ...this._tags };
    newScope._extra = { ...this._extra };
    newScope._contexts = { ...this._contexts };

    newScope._user = this._user;
    newScope._transactionName = this._transactionName;
    newScope._fingerprint = this._fingerprint;
    newScope._sdkProcessingMetadata = { ...this._sdkProcessingMetadata };
    newScope._lastEventId = this._lastEventId;

    return newScope;
  }

  /**
   * Set the user for this scope.
   * Set to `null` to unset the user.
   */
  public setUser(user: User | null): this {
    // If null is passed we want to unset everything, but still define keys,
    // so that later down in the pipeline any existing values are cleared.
    this._user = user || {
      email: undefined,
      id: undefined,
      ip_address: undefined,
      username: undefined,
    };

    // if (this._session) {
    //   updateSession(this._session, { user });
    // }

    this._notifyScopeListeners();
    return this;
  }

  /**
   * Set an object that will be merged into existing tags on the scope,
   * and will be sent as tags data with the event.
   */
  public setTags(tags: { [key: string]: Primitive }): this {
    this._tags = {
      ...this._tags,
      ...tags,
    };
    this._notifyScopeListeners();
    return this;
  }

  /**
   * Set a single tag that will be sent as tags data with the event.
   */
  public setTag(key: string, value: Primitive): this {
    this._tags = { ...this._tags, [key]: value };
    this._notifyScopeListeners();
    return this;
  }

  /**
   * Set an object that will be merged into existing extra on the scope,
   * and will be sent as extra data with the event.
   */
  public setExtras(extras: Extras): this {
    this._extra = {
      ...this._extra,
      ...extras,
    };
    this._notifyScopeListeners();
    return this;
  }

  /**
   * Set a single key:value extra entry that will be sent as extra data with the event.
   */
  public setExtra(key: string, extra: Extra): this {
    this._extra = { ...this._extra, [key]: extra };
    this._notifyScopeListeners();
    return this;
  }

  /**
   * Sets context data with the given name.
   * Data passed as context will be normalized. You can also pass `null` to unset the context.
   * Note that context data will not be merged - calling `setContext` will overwrite an existing context with the same key.
   */
  public setContext(key: string, context: Context | null): this {
    if (context === null) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete this._contexts[key];
    } else {
      this._contexts[key] = context;
    }

    this._notifyScopeListeners();
    return this;
  }

  /**
   * Clears the current scope and resets its properties.
   * Note: The client will not be cleared.
   */
  public clear(): this {
    // client is not cleared here on purpose!
    this._tags = {};
    this._extra = {};
    this._user = {};
    this._contexts = {};
    this._transactionName = undefined;
    this._fingerprint = undefined;

    this._notifyScopeListeners();
    return this;
  }

  /**
   * Get the data of this scope, which should be applied to an event during processing.
   */
  public getScopeData(): ScopeData {
    return {
      contexts: this._contexts,
      tags: this._tags,
      extra: this._extra,
      user: this._user,
      fingerprint: this._fingerprint || [],
      sdkProcessingMetadata: this._sdkProcessingMetadata,
      transactionName: this._transactionName,
    };
  }
  /**
   * This will be called on every set call.
   */
  protected _notifyScopeListeners(): void {
    // We need this check for this._notifyingListeners to be able to work on scope during updates
    // If this check is not here we'll produce endless recursion when something is done with the scope
    // during the callback.
    if (!this._notifyingListeners) {
      this._notifyingListeners = true;
      this._scopeListeners.forEach((callback) => {
        callback(this);
      });
      this._notifyingListeners = false;
    }
  }
}

// scopeHub.ts
class ScopeHub {
  private _currentScope: Scope;

  constructor() {
    this._currentScope = new Scope();
  }

  /** 用户写数据用 */
  getCurrentScope(): Scope {
    return this._currentScope;
  }

  /** 事件采集用：生成快照 */
  getScopeSnapshot(): Scope {
    return this._currentScope.clone();
  }

  /** 可选：隔离作用域 */
  withScope(cb: (scope: Scope) => void) {
    const parent = this._currentScope;
    const child = parent.clone();
    this._currentScope = child;

    try {
      cb(child);
    } finally {
      this._currentScope = parent;
    }
  }
}

export const scopeHub = new ScopeHub();
