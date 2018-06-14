function Debug(element, displayCount, filter) {

   var items = [];
   var debugCount = 0;
   
   this.element = element;
   
   this.add = function(message, obj) {
   
      if (!this.element)
         return;
         
      if (!filter || filter.indexOf(message) >= 0) {
         var item = new Item(message, obj);

         items.push(item);
     
         var count;
   
         if (items.length < displayCount)
            count = items.length;
         else
            count = displayCount;

         if (count == 0)
            return;
  
         var start = items.length - count;
   
         var select = items.slice(start);
   
         select = select.reverse();
   
         element.innerHTML = select.join("<br/>");
      }
   }
   
   this.break = function(message, obj) {
      if (!filter || filter.indexOf(message) >= 0) {
         var item = new Item(message, obj);
         alert(item);
      }
   }
   
   function Item(message, obj) {
      this.message = message;
      this.obj = obj;
      this.timeStamp = new Date();
      this.count = ++debugCount;
      this.toString = function() {
      
         var msg = this.count.toString();
         
         msg += " " + this.timeStamp.toLocaleTimeString();
         
         msg += " " + message;
         
         if (obj != undefined)
            msg += ": " + JSON.stringify(obj);
         
         return msg;
      }
      
   }

}