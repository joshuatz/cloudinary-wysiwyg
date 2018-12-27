class Helpers {
  constructor(props){
    this.jQuery = window.jQuery;
    this.Materialize = window.M;
    this.$ = this.jQuery;
  }

  mtz = {
    init : function(){
      let $ = this.$;
      //$('.modal').modal();
      this.Materialize.AutoInit();
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
}

export default Helpers;