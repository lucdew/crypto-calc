export interface ISendToMenuService {
  registerMenuItem(receiverName: string, menuPath: string);
  updateContext(contextName: string, context: Object);
  buildMenuTree(inclusions ? : Array < string > , exclusions ? : Array < string > ): Object;
  sendTo(path: string, data: Buffer, scope: any);
}

export class SendToMenuService implements ISendToMenuService {
  items: any = {};
  memory: any = {};

  $timeout: ng.ITimeoutService;
  $parse: ng.IParseService;

  constructor($timeout: ng.ITimeoutService, $parse: ng.IParseService) {
    this.$timeout = $timeout;
    this.$parse = $parse;
  }

  updateContext(contextName: string, context: Object) {

    _.forOwn(this.memory, (cb, propName) => {
      if (propName.indexOf(contextName) !== 0) {
        return;
      }
      cb.call(null, context);
      delete this.memory[propName];
    });

  }

  registerMenuItem(menuItemName: string, menuPath: string) {
    this.items[menuItemName] = {
      menuPath: menuPath
    };
  };

  buildMenuTree(inclusions ? : Array < string > , exclusions ? : Array < string > ) {
    let filteredMenuItems = _(this.items).pickBy((value, key) => {
      return !inclusions || inclusions.length === 0 ||
        _.find(inclusions, elt => {
          return _.startsWith(key, elt);
        }) !== undefined;
    }).pickBy((value, key) => {
      return !exclusions || exclusions.length === 0 ||
        _.find(exclusions, elt => {
          return _.startsWith(key, elt);
        }) === undefined;
    }).value();

    let menu = {};

    _.forEach(this.items, (value, key) => {

      let parentItem = menu;
      let pathElts = value.menuPath.split('.');
      for (let idx = 0; idx < pathElts.length; idx++) {
        let pathElt = pathElts[idx];
        if (!parentItem[pathElt]) {
          parentItem[pathElt] = {};
        }

        if (idx === pathElts.length - 1) {
          parentItem[pathElt] = key;
        } else {
          parentItem = parentItem[pathElt];
        }
      }
    });

    return menu;
  }

  sendTo(name: string, data: Buffer, scope: any) {

    let dotIndex = name.indexOf('.');
    let scopeName = name.substring(0, dotIndex);
    let propertyName = name.substring(dotIndex + 1);
    let self = this;

    let updateFunc = function(aScope) {
      self.$timeout(() => {
        let setter = self.$parse(propertyName).assign;
        setter(aScope, new Buffer(data.toString('hex'), 'hex'));
      });
    };

    if (scope[scopeName]) {
      updateFunc.call(null, scope[scopeName]);
    } else {
      this.memory[name] = updateFunc;
    }

  };
  
  public static Factory() {
    let service = ($timeout:ng.ITimeoutService, $parse:ng.IParseService) => {
      return new SendToMenuService($timeout,$parse);
    };

    service['$inject'] = ['$timeout', '$parse'];

    return service;
  }
  
}
