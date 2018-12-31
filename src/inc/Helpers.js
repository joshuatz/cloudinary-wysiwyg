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
      }.bind(this));
    }.bind(this),
    modal : function(selector){
      let $ = this.$;
      var Materialize = this.Materialize;

      let getInstance = function(element){
        /*
        if (typeof(elemOrSelector)==='string'){
          let selector = elemOrSelector;
          return this.Materialize.Modal.getInstance($(selector));
        }
        else {
          let elem = elemOrSelector;
          return this.Materialize.Modal.getInstance(elem);
        }
        */
       if ($(selector).length > 0){
         let elems = $(selector);
         let instances = Materialize.Modal.getInstance(elems);
         if (typeof(instances)==='undefined' || instances ===null){
           instances = Materialize.Modal.init(elems);
         }
         debugger;
         return instances[0];
       }
      }.bind(this);
      
      // Should return jQuery iterable object
      let getInstances = function(){
        console.log(Materialize);
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
      }.bind(this);

      let open = function(){
        getInstances().each((index,val)=>{val.open();})
      }
      // Chain
      return {
        open : open.bind(this)
      }
    }.bind(this)
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
}

export default Helpers;