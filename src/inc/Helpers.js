class Helpers {
  constructor(props){
    this.jQuery = window.jQuery;
    this.Materialize = window.M;
    this.$ = this.jQuery;
  }

  mtz = {
    init : function(){
      let $ = this.$;
      $(document).ready(function(){
        this.Materialize.AutoInit();
        $('[data-tooltip]').tooltip();
        $('.tabs').tabs();
      }.bind(this));
    }.bind(this),
    modal : function(selector){
      let $ = this.$;
      var Materialize = this.Materialize;
      
      // Should return jQuery iterable object
      let getInstances = function(){
        var instances = $(selector).map((index,val)=>{
          var elem = val;
          let instance = Materialize.Modal.getInstance(elem);
          if (typeof(instance)==='undefined' || instance===null){
            // Element did not get initialized properly
            return (Materialize.Modal.init(elem));
          }
          return instance;
        });
        return instances;
      };

      let open = function(){
        getInstances().each((index,val)=>{val.open();})
      }
      // Chain
      return {
        open : open.bind(this)
      }
    }.bind(this)
  }

  toast(msg,style){
    let styleMappings = {
      'info' : 'toast toastInfo defaultPrimaryColor',
      'success' : 'toast toastSuccess green',
      'warning' : 'toast toastWarning warningColor',
      'error' : 'toast toastError dangerColor'
    }
    style = (style || 'info');
    // Construct Materialize toast config
    let toastConfig = {
      html : msg,
      classes : styleMappings[style]
    }
    this.Materialize.toast(toastConfig);
    // @TODO - spruce up
  }

  getPlaceholderImage(width,height){
    return 'https://via.placeholder.com/' + width + 'x' + height;
  }

  //https://stackoverflow.com/a/6394168
  index(obj,is, value) {
    if (typeof is == 'string')
      return this.index(obj,is.split('.'), value);
    else if (is.length==1 && value!==undefined)
      return obj[is[0]] = value;
    else if (is.length==0)
      return obj;
    else
      return this.index(obj[is[0]],is.slice(1), value);
  }

  /**
   * Lazy way of binding a group of functions to a value/state
   * @param {object} object
   * @param {*} bindTo 
   */
  bindObjectMethod(object,bindTo){
    let boundObj = {};
    Object.keys(object).forEach((key,index)=>{
      if (typeof(object[key])==='function'){
        boundObj[key] = object[key].bind(bindTo);
      }
      else {
        boundObj[key] = object[key];
      }
    });
    return boundObj;
  }

  /**
   * @param {object||array} objectA - object, or array of objects to merge together
   * @param {object} [objectB] - object to merge into object A
   * @returns {object} Merged Object
   */
  objectMerge = function(objectA,objectB){
    let mergedObj = {};
    if (Array.isArray(objectA)){
      let objArr = objectA;
      for (var x=0; x<objArr.length; x++){
        mergedObj = this.objectMerge(mergedObj,objArr[x]);
      }
    }
    else {
      for (var attr in objectA){mergedObj[attr] = objectA[attr]};
      for (var attr in objectB){mergedObj[attr] = objectB[attr]};
    }
    return mergedObj;
  }

  base64Safe = function(myString){
    return encodeURIComponent(btoa(myString));
  }

  randomChar = function(){
    return Math.random().toString(36).substring(2,3);
  }
  
  arrayAndObjPropCompare = function(arrayOrObjA,arrayOrObjB){
    // Force array comparison
    let arrayA = Array.isArray(arrayOrObjA)===true ? arrayOrObjA : (typeof(arrayOrObjA)==='object' ? Object.keys(arrayOrObjA) : []);
    let arrayB = Array.isArray(arrayOrObjB)===true ? arrayOrObjB : (typeof(arrayOrObjB)==='object' ? Object.keys(arrayOrObjB) : []);
    let matches = 0;
    for (var a=0; a<arrayA.length; a++){
      if (arrayB.indexOf(arrayA[a])!==-1){
        matches++;
      }
    }
    return matches;
  }
}

export default Helpers;