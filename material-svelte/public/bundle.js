(function (exports) {
  'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function _typeof(obj) {
        return typeof obj;
      };
    } else {
      _typeof = function _typeof(obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (_typeof(call) === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function noop() {}

  function run(fn) {
    return fn();
  }

  function blank_object() {
    return Object.create(null);
  }

  function run_all(fns) {
    fns.forEach(run);
  }

  function is_function(thing) {
    return typeof thing === 'function';
  }

  function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || a && _typeof(a) === 'object' || typeof a === 'function';
  }

  function null_to_empty(value) {
    return value == null ? '' : value;
  }

  function append(target, node) {
    target.appendChild(node);
  }

  function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
  }

  function detach(node) {
    node.parentNode.removeChild(node);
  }

  function element(name) {
    return document.createElement(name);
  }

  function text(data) {
    return document.createTextNode(data);
  }

  function space() {
    return text(' ');
  }

  function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return function () {
      return node.removeEventListener(event, handler, options);
    };
  }

  function attr(node, attribute, value) {
    if (value == null) node.removeAttribute(attribute);else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
  }

  function children(element) {
    return Array.from(element.childNodes);
  }

  function set_data(text, data) {
    data = '' + data;
    if (text.data !== data) text.data = data;
  }

  var current_component;

  function set_current_component(component) {
    current_component = component;
  }

  var dirty_components = [];
  var binding_callbacks = [];
  var render_callbacks = [];
  var flush_callbacks = [];
  var resolved_promise = Promise.resolve();
  var update_scheduled = false;

  function schedule_update() {
    if (!update_scheduled) {
      update_scheduled = true;
      resolved_promise.then(flush);
    }
  }

  function add_render_callback(fn) {
    render_callbacks.push(fn);
  }

  var flushing = false;
  var seen_callbacks = new Set();

  function flush() {
    if (flushing) return;
    flushing = true;

    do {
      // first, call beforeUpdate functions
      // and update components
      for (var i = 0; i < dirty_components.length; i += 1) {
        var component = dirty_components[i];
        set_current_component(component);
        update(component.$$);
      }

      dirty_components.length = 0;

      while (binding_callbacks.length) {
        binding_callbacks.pop()();
      } // then, once components are updated, call
      // afterUpdate functions. This may cause
      // subsequent updates...


      for (var _i = 0; _i < render_callbacks.length; _i += 1) {
        var callback = render_callbacks[_i];

        if (!seen_callbacks.has(callback)) {
          // ...so guard against infinite loops
          seen_callbacks.add(callback);
          callback();
        }
      }

      render_callbacks.length = 0;
    } while (dirty_components.length);

    while (flush_callbacks.length) {
      flush_callbacks.pop()();
    }

    update_scheduled = false;
    flushing = false;
    seen_callbacks.clear();
  }

  function update($$) {
    if ($$.fragment !== null) {
      $$.update();
      run_all($$.before_update);
      var dirty = $$.dirty;
      $$.dirty = [-1];
      $$.fragment && $$.fragment.p($$.ctx, dirty);
      $$.after_update.forEach(add_render_callback);
    }
  }

  var outroing = new Set();

  function transition_in(block, local) {
    if (block && block.i) {
      outroing.delete(block);
      block.i(local);
    }
  }

  function mount_component(component, target, anchor) {
    var _component$$$ = component.$$,
        fragment = _component$$$.fragment,
        on_mount = _component$$$.on_mount,
        on_destroy = _component$$$.on_destroy,
        after_update = _component$$$.after_update;
    fragment && fragment.m(target, anchor); // onMount happens before the initial afterUpdate

    add_render_callback(function () {
      var new_on_destroy = on_mount.map(run).filter(is_function);

      if (on_destroy) {
        on_destroy.push.apply(on_destroy, _toConsumableArray(new_on_destroy));
      } else {
        // Edge case - component was destroyed immediately,
        // most likely as a result of a binding initialising
        run_all(new_on_destroy);
      }

      component.$$.on_mount = [];
    });
    after_update.forEach(add_render_callback);
  }

  function destroy_component(component, detaching) {
    var $$ = component.$$;

    if ($$.fragment !== null) {
      run_all($$.on_destroy);
      $$.fragment && $$.fragment.d(detaching); // TODO null out other refs, including component.$$ (but need to
      // preserve final state?)

      $$.on_destroy = $$.fragment = null;
      $$.ctx = [];
    }
  }

  function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
      dirty_components.push(component);
      schedule_update();
      component.$$.dirty.fill(0);
    }

    component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
  }

  function init(component, options, instance, create_fragment, not_equal, props) {
    var dirty = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : [-1];
    var parent_component = current_component;
    set_current_component(component);
    var prop_values = options.props || {};
    var $$ = component.$$ = {
      fragment: null,
      ctx: null,
      // state
      props: props,
      update: noop,
      not_equal: not_equal,
      bound: blank_object(),
      // lifecycle
      on_mount: [],
      on_destroy: [],
      before_update: [],
      after_update: [],
      context: new Map(parent_component ? parent_component.$$.context : []),
      // everything else
      callbacks: blank_object(),
      dirty: dirty
    };
    var ready = false;
    $$.ctx = instance ? instance(component, prop_values, function (i, ret) {
      var value = (arguments.length <= 2 ? 0 : arguments.length - 2) ? arguments.length <= 2 ? undefined : arguments[2] : ret;

      if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
        if ($$.bound[i]) $$.bound[i](value);
        if (ready) make_dirty(component, i);
      }

      return ret;
    }) : [];
    $$.update();
    ready = true;
    run_all($$.before_update); // `false` as a special case of no DOM component

    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;

    if (options.target) {
      if (options.hydrate) {
        var nodes = children(options.target); // eslint-disable-next-line @typescript-eslint/no-non-null-assertion

        $$.fragment && $$.fragment.l(nodes);
        nodes.forEach(detach);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        $$.fragment && $$.fragment.c();
      }

      if (options.intro) transition_in(component.$$.fragment);
      mount_component(component, options.target, options.anchor);
      flush();
    }

    set_current_component(parent_component);
  }

  var SvelteComponent = /*#__PURE__*/function () {
    function SvelteComponent() {
      _classCallCheck(this, SvelteComponent);
    }

    _createClass(SvelteComponent, [{
      key: "$destroy",
      value: function $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
      }
    }, {
      key: "$on",
      value: function $on(type, callback) {
        var callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
        callbacks.push(callback);
        return function () {
          var index = callbacks.indexOf(callback);
          if (index !== -1) callbacks.splice(index, 1);
        };
      }
    }, {
      key: "$set",
      value: function $set() {// overridden by instance, if it has props
      }
    }]);

    return SvelteComponent;
  }();

  function _createSuper(Derived) { return function () { var Super = _getPrototypeOf(Derived), result; if (_isNativeReflectConstruct()) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

  function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

  function add_css() {
    var style = element("style");
    style.id = "svelte-19y087o-style";
    style.textContent = ".mdc-touch-target-wrapper.svelte-19y087o.svelte-19y087o{display:inline}.mdc-elevation-overlay.svelte-19y087o.svelte-19y087o{position:absolute;border-radius:inherit;opacity:0;pointer-events:none;transition:opacity 280ms cubic-bezier(0.4, 0, 0.2, 1);background-color:#fff}.mdc-button.svelte-19y087o.svelte-19y087o{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-family:Roboto, sans-serif;font-family:var(--mdc-typography-button-font-family, var(--mdc-typography-font-family, Roboto, sans-serif));font-size:0.875rem;font-size:var(--mdc-typography-button-font-size, 0.875rem);line-height:2.25rem;line-height:var(--mdc-typography-button-line-height, 2.25rem);font-weight:500;font-weight:var(--mdc-typography-button-font-weight, 500);letter-spacing:0.0892857143em;letter-spacing:var(--mdc-typography-button-letter-spacing, 0.0892857143em);text-decoration:none;text-decoration:var(--mdc-typography-button-text-decoration, none);text-transform:uppercase;text-transform:var(--mdc-typography-button-text-transform, uppercase);padding:0 8px 0 8px;position:relative;display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;min-width:64px;border:none;outline:none;line-height:inherit;user-select:none;-webkit-appearance:none;overflow:visible;vertical-align:middle;border-radius:4px}.mdc-button.svelte-19y087o.svelte-19y087o::-moz-focus-inner{padding:0;border:0}.mdc-button.svelte-19y087o.svelte-19y087o:active{outline:none}.mdc-button.svelte-19y087o.svelte-19y087o:hover{cursor:pointer}.mdc-button.svelte-19y087o.svelte-19y087o:disabled{cursor:default;pointer-events:none}.mdc-button.svelte-19y087o .mdc-button__ripple.svelte-19y087o{border-radius:4px}.mdc-button.svelte-19y087o.svelte-19y087o:not(:disabled){background-color:transparent}.mdc-button.svelte-19y087o.svelte-19y087o:disabled{background-color:transparent}.mdc-button.svelte-19y087o.svelte-19y087o:not(:disabled){color:#6200ee;color:var(--mdc-theme-primary, #6200ee)}.mdc-button.svelte-19y087o.svelte-19y087o:disabled{color:rgba(0, 0, 0, 0.38)}.mdc-button__label+.mdc-button__icon.svelte-19y087o.svelte-19y087o{margin-left:8px;margin-right:0}[dir=rtl] .mdc-button__label+.mdc-button__icon.svelte-19y087o.svelte-19y087o{margin-left:0;margin-right:8px}.mdc-button--raised .mdc-button__label+.mdc-button__icon.svelte-19y087o.svelte-19y087o,.mdc-button--unelevated .mdc-button__label+.mdc-button__icon.svelte-19y087o.svelte-19y087o,.mdc-button--outlined .mdc-button__label+.mdc-button__icon.svelte-19y087o.svelte-19y087o{margin-left:8px;margin-right:-4px}[dir=rtl] .mdc-button--raised .mdc-button__label+.mdc-button__icon.svelte-19y087o.svelte-19y087o,[dir=rtl] .mdc-button--unelevated .mdc-button__label+.mdc-button__icon.svelte-19y087o.svelte-19y087o,[dir=rtl] .mdc-button--outlined .mdc-button__label+.mdc-button__icon.svelte-19y087o.svelte-19y087o{margin-left:-4px;margin-right:8px}.mdc-button--raised.svelte-19y087o.svelte-19y087o,.mdc-button--unelevated.svelte-19y087o.svelte-19y087o{padding:0 16px 0 16px}.mdc-button--raised.svelte-19y087o.svelte-19y087o:not(:disabled),.mdc-button--unelevated.svelte-19y087o.svelte-19y087o:not(:disabled){background-color:#6200ee;background-color:var(--mdc-theme-primary, #6200ee)}.mdc-button--raised.svelte-19y087o.svelte-19y087o:not(:disabled),.mdc-button--unelevated.svelte-19y087o.svelte-19y087o:not(:disabled){color:#fff;color:var(--mdc-theme-on-primary, #fff)}.mdc-button--raised.svelte-19y087o.svelte-19y087o:disabled,.mdc-button--unelevated.svelte-19y087o.svelte-19y087o:disabled{background-color:rgba(0, 0, 0, 0.12)}.mdc-button--raised.svelte-19y087o.svelte-19y087o:disabled,.mdc-button--unelevated.svelte-19y087o.svelte-19y087o:disabled{color:rgba(0, 0, 0, 0.38)}.mdc-button--raised.svelte-19y087o.svelte-19y087o{box-shadow:0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);transition:box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1)}.mdc-button--raised.svelte-19y087o.svelte-19y087o:hover,.mdc-button--raised.svelte-19y087o.svelte-19y087o:focus{box-shadow:0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12)}.mdc-button--raised.svelte-19y087o.svelte-19y087o:active{box-shadow:0px 5px 5px -3px rgba(0, 0, 0, 0.2), 0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12)}.mdc-button--raised.svelte-19y087o.svelte-19y087o:disabled{box-shadow:0px 0px 0px 0px rgba(0, 0, 0, 0.2), 0px 0px 0px 0px rgba(0, 0, 0, 0.14), 0px 0px 0px 0px rgba(0, 0, 0, 0.12)}.mdc-button--outlined.svelte-19y087o.svelte-19y087o{padding:0 15px 0 15px;border-width:1px;border-style:solid}.mdc-button--outlined.svelte-19y087o .mdc-button__ripple.svelte-19y087o{top:-1px;left:-1px;border:1px solid transparent}.mdc-button--outlined.svelte-19y087o.svelte-19y087o:not(:disabled){border-color:rgba(0, 0, 0, 0.12)}.mdc-button--outlined.svelte-19y087o.svelte-19y087o:disabled{border-color:rgba(0, 0, 0, 0.12)}.mdc-button--touch.svelte-19y087o.svelte-19y087o{margin-top:6px;margin-bottom:6px}@keyframes svelte-19y087o-mdc-ripple-fg-radius-in{from{animation-timing-function:cubic-bezier(0.4, 0, 0.2, 1);transform:translate(var(--mdc-ripple-fg-translate-start, 0)) scale(1)}to{transform:translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1))}}@keyframes svelte-19y087o-mdc-ripple-fg-opacity-in{from{animation-timing-function:linear;opacity:0}to{opacity:var(--mdc-ripple-fg-opacity, 0)}}@keyframes svelte-19y087o-mdc-ripple-fg-opacity-out{from{animation-timing-function:linear;opacity:var(--mdc-ripple-fg-opacity, 0)}to{opacity:0}}.mdc-button.svelte-19y087o.svelte-19y087o{--mdc-ripple-fg-size:0;--mdc-ripple-left:0;--mdc-ripple-top:0;--mdc-ripple-fg-scale:1;--mdc-ripple-fg-translate-end:0;--mdc-ripple-fg-translate-start:0;-webkit-tap-highlight-color:rgba(0, 0, 0, 0)}.mdc-button.svelte-19y087o .mdc-button__ripple.svelte-19y087o::before,.mdc-button.svelte-19y087o .mdc-button__ripple.svelte-19y087o::after{position:absolute;border-radius:50%;opacity:0;pointer-events:none;content:\"\"}.mdc-button.svelte-19y087o .mdc-button__ripple.svelte-19y087o::before{transition:opacity 15ms linear, background-color 15ms linear;z-index:1}.mdc-button.mdc-ripple-upgraded.svelte-19y087o .mdc-button__ripple.svelte-19y087o::before{transform:scale(var(--mdc-ripple-fg-scale, 1))}.mdc-button.mdc-ripple-upgraded.svelte-19y087o .mdc-button__ripple.svelte-19y087o::after{top:0;left:0;transform:scale(0);transform-origin:center center}.mdc-button.mdc-ripple-upgraded--unbounded.svelte-19y087o .mdc-button__ripple.svelte-19y087o::after{top:var(--mdc-ripple-top, 0);left:var(--mdc-ripple-left, 0)}.mdc-button.mdc-ripple-upgraded--foreground-activation.svelte-19y087o .mdc-button__ripple.svelte-19y087o::after{animation:svelte-19y087o-mdc-ripple-fg-radius-in 225ms forwards, svelte-19y087o-mdc-ripple-fg-opacity-in 75ms forwards}.mdc-button.mdc-ripple-upgraded--foreground-deactivation.svelte-19y087o .mdc-button__ripple.svelte-19y087o::after{animation:svelte-19y087o-mdc-ripple-fg-opacity-out 150ms;transform:translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1))}.mdc-button.svelte-19y087o .mdc-button__ripple.svelte-19y087o::before,.mdc-button.svelte-19y087o .mdc-button__ripple.svelte-19y087o::after{top:calc(50% - 100%);left:calc(50% - 100%);width:200%;height:200%}.mdc-button.mdc-ripple-upgraded.svelte-19y087o .mdc-button__ripple.svelte-19y087o::after{width:var(--mdc-ripple-fg-size, 100%);height:var(--mdc-ripple-fg-size, 100%)}.mdc-button.svelte-19y087o .mdc-button__ripple.svelte-19y087o::before,.mdc-button.svelte-19y087o .mdc-button__ripple.svelte-19y087o::after{background-color:#6200ee;background-color:var(--mdc-theme-primary, #6200ee)}.mdc-button.svelte-19y087o:hover .mdc-button__ripple.svelte-19y087o::before{opacity:0.04}.mdc-button.mdc-ripple-upgraded--background-focused.svelte-19y087o .mdc-button__ripple.svelte-19y087o::before,.mdc-button.svelte-19y087o:not(.mdc-ripple-upgraded):focus .mdc-button__ripple.svelte-19y087o::before{transition-duration:75ms;opacity:0.12}.mdc-button.svelte-19y087o:not(.mdc-ripple-upgraded) .mdc-button__ripple.svelte-19y087o::after{transition:opacity 150ms linear}.mdc-button.svelte-19y087o:not(.mdc-ripple-upgraded):active .mdc-button__ripple.svelte-19y087o::after{transition-duration:75ms;opacity:0.12}.mdc-button.mdc-ripple-upgraded.svelte-19y087o.svelte-19y087o{--mdc-ripple-fg-opacity:0.12}.mdc-button.svelte-19y087o .mdc-button__ripple.svelte-19y087o{position:absolute;box-sizing:content-box;width:100%;height:100%;overflow:hidden}.mdc-button.svelte-19y087o:not(.mdc-button--outlined) .mdc-button__ripple.svelte-19y087o{top:0;left:0}.mdc-button--raised.svelte-19y087o .mdc-button__ripple.svelte-19y087o::before,.mdc-button--raised.svelte-19y087o .mdc-button__ripple.svelte-19y087o::after,.mdc-button--unelevated.svelte-19y087o .mdc-button__ripple.svelte-19y087o::before,.mdc-button--unelevated.svelte-19y087o .mdc-button__ripple.svelte-19y087o::after{background-color:#fff;background-color:var(--mdc-theme-on-primary, #fff)}.mdc-button--raised.svelte-19y087o:hover .mdc-button__ripple.svelte-19y087o::before,.mdc-button--unelevated.svelte-19y087o:hover .mdc-button__ripple.svelte-19y087o::before{opacity:0.08}.mdc-button--raised.mdc-ripple-upgraded--background-focused.svelte-19y087o .mdc-button__ripple.svelte-19y087o::before,.mdc-button--raised.svelte-19y087o:not(.mdc-ripple-upgraded):focus .mdc-button__ripple.svelte-19y087o::before,.mdc-button--unelevated.mdc-ripple-upgraded--background-focused.svelte-19y087o .mdc-button__ripple.svelte-19y087o::before,.mdc-button--unelevated.svelte-19y087o:not(.mdc-ripple-upgraded):focus .mdc-button__ripple.svelte-19y087o::before{transition-duration:75ms;opacity:0.24}.mdc-button--raised.svelte-19y087o:not(.mdc-ripple-upgraded) .mdc-button__ripple.svelte-19y087o::after,.mdc-button--unelevated.svelte-19y087o:not(.mdc-ripple-upgraded) .mdc-button__ripple.svelte-19y087o::after{transition:opacity 150ms linear}.mdc-button--raised.svelte-19y087o:not(.mdc-ripple-upgraded):active .mdc-button__ripple.svelte-19y087o::after,.mdc-button--unelevated.svelte-19y087o:not(.mdc-ripple-upgraded):active .mdc-button__ripple.svelte-19y087o::after{transition-duration:75ms;opacity:0.24}.mdc-button--raised.mdc-ripple-upgraded.svelte-19y087o.svelte-19y087o,.mdc-button--unelevated.mdc-ripple-upgraded.svelte-19y087o.svelte-19y087o{--mdc-ripple-fg-opacity:0.24}.mdc-button.svelte-19y087o.svelte-19y087o{height:36px}";
    append(document.head, style);
  }

  function create_fragment(ctx) {
    var scipt;
    var t0;
    var button;
    var div;
    var t1;
    var span;
    var t2;
    var button_class_value;
    var dispose;
    return {
      c: function c() {
        scipt = element("scipt");
        t0 = space();
        button = element("button");
        div = element("div");
        t1 = space();
        span = element("span");
        t2 = text(
        /*label*/
        ctx[0]);
        attr(scipt, "context", "module");
        attr(div, "class", "mdc-button__ripple svelte-19y087o");
        attr(span, "class", "mdc-button__label");
        attr(button, "class", button_class_value = "" + (null_to_empty(
        /*classNames*/
        ctx[3].join(" ")) + " svelte-19y087o"));
        attr(button, "style",
        /*style*/
        ctx[2]);
      },
      m: function m(target, anchor, remount) {
        insert(target, scipt, anchor);
        insert(target, t0, anchor);
        insert(target, button, anchor);
        append(button, div);
        append(button, t1);
        append(button, span);
        append(span, t2);
        if (remount) dispose();
        dispose = listen(button, "click", function () {
          if (is_function(
          /*onclick*/
          ctx[1]))
            /*onclick*/
            ctx[1].apply(this, arguments);
        });
      },
      p: function p(new_ctx, _ref) {
        var _ref2 = _slicedToArray(_ref, 1),
            dirty = _ref2[0];

        ctx = new_ctx;
        if (dirty &
        /*label*/
        1) set_data(t2,
        /*label*/
        ctx[0]);

        if (dirty &
        /*style*/
        4) {
          attr(button, "style",
          /*style*/
          ctx[2]);
        }
      },
      i: noop,
      o: noop,
      d: function d(detaching) {
        if (detaching) detach(scipt);
        if (detaching) detach(t0);
        if (detaching) detach(button);
        dispose();
      }
    };
  }

  function instance($$self, $$props, $$invalidate) {
    var _$$props$class = $$props.class,
        className = _$$props$class === void 0 ? "" : _$$props$class;
    var _$$props$label = $$props.label,
        label = _$$props$label === void 0 ? "label" : _$$props$label;
    var onclick = $$props.onclick;
    var style = $$props.style;
    var classNames = ["mdc-button", className];

    $$self.$set = function ($$props) {
      if ("class" in $$props) $$invalidate(4, className = $$props.class);
      if ("label" in $$props) $$invalidate(0, label = $$props.label);
      if ("onclick" in $$props) $$invalidate(1, onclick = $$props.onclick);
      if ("style" in $$props) $$invalidate(2, style = $$props.style);
    };

    return [label, onclick, style, classNames, className];
  }

  var Button = /*#__PURE__*/function (_SvelteComponent) {
    _inherits(Button, _SvelteComponent);

    var _super = _createSuper(Button);

    function Button(options) {
      var _this;

      _classCallCheck(this, Button);

      _this = _super.call(this);
      if (!document.getElementById("svelte-19y087o-style")) add_css();
      init(_assertThisInitialized(_this), options, instance, create_fragment, safe_not_equal, {
        class: 4,
        label: 0,
        onclick: 1,
        style: 2
      });
      return _this;
    }

    return Button;
  }(SvelteComponent);

  exports.Button = Button;

  return exports;

}({}));
