function TouchEvents(canvas) {

   
   var element = canvas.element;
   var gesture = null;
   var startPoint = null;
   var toTouches = null;
   
   /*
   ** Required functions/properties **

   canvas.penDown = function(point)

   canvas.penUp = function()

   canvas.movePen = function(point)

   canvas.scaleAndOffset = function(pointOffset, numberScale, pointCenter)
   
   canvas.element = htmlCanvasElement

   canvas.click = function(point)
  
   canvas.doubleClick(point);
   
   canvas.longClick(point)
   
   function draw()
   
   function Point()
   
   */

   // set up listeners to canvas events

   element.onclick =
      function(event) {
         canvas.click(startPoint);
      }
      
   element.ondblclick = 
      function(event) {
         canvas.doubleClick(startPoint);
      }
      
   element.oncontextmenu = 
      function(event) {
         canvas.longClick(startPoint);
      }
      
   // prevent on context menu from
   // selecting text
   document.onselectstart = 
      function(event) {
         if (event.target == canvas.element)

            event.preventDefault();
      }

   

   element.ontouchstart = function (event) {
      debug.add("startTouch",
         {
            currentGesture: gesture,
            startPoint: startPoint ? startPoint.round() : null
         }
      );
      
      switch (event.touches.length) {
      case 1:
         // started first touch, reset
         // gesture and save the
         // start poimt
         gesture = null;
         startPoint = getPoint(event.touches[0]);
         break;
      case 2:
         // started second touch,
         // finish any pen gesturw,
         // set gesture to scroll
         // and save both touches
         // for use in scrolling
         if (gesture == "pen");
            canvas.penUp();
         
         gesture = "scroll";
         toTouches = event.touches;
         
         break;
      }
      
   }

   element.ontouchmove = function(event) {
      debug.add("moveTouch",
         {
            currentGesture: gesture,
            startPoint: startPoint ? startPoint.round() : null
         }
      );
      
                     
      switch (gesture) {
      case null:
         // start new pen gesture
         gesture = "pen";
         canvas.penDown(startPoint);
               
      case "pen":
         // move existing pen
         var point = getPoint(event.touches[0]);

         canvas.movePen(point);
         break;
      case "scroll":
         // scrolling, but only if we
         // have at least two gestures
         if (event.touches.length < 2)
            break;
         
         
         // get points from that moved 
         // to
         // (from points -> to points)
         
         var fromTouches = toTouches;

         toTouches = event.touches;
   
         var toPoints = getPoints(toTouches);
      
         var fromPoints = getPoints(fromTouches);
      
         // get the offset, scale and
         // center of this scrolling
         var offset = getOffset();
         var scale = getScale();
         var center = getCenter();
 
         // scale and offset the canvas
         // geometry about the center
         // point
         canvas.scaleAndOffset(offset, scale, center);

         // re draw the canvas
         draw();
         
         break;
      }
      

      function getScale() {

         var fromDistance = fromPoints[0].distance(fromPoints[1]);
         
         var toDistance = toPoints[0].distance(toPoints[1]);
         
         var scale = toDistance / fromDistance;
         
         return scale;
         
      
      }
      
      function getOffset() {
        
        
         var fromMiddle = fromPoints[0].middle(fromPoints[1]);
         var toMiddle = toPoints[0].middle(toPoints[1]);
       
         var offset = new Point(
            toMiddle.x - fromMiddle.x,
            toMiddle.y - fromMiddle.y
         );
         
         return offset;
      }
      
      function getCenter() {
        
         var center = toPoints[0].middle(toPoints[1]);
         return center;
      }

   }
   
   element.ontouchend =
      element.ontouchcancel =
   function(event) {
      debug.add("endTouch");
      
      if (gesture == "pen")
         canvas.penUp();
         
   }


   function getPoint(touch) {
  
      var point = new Point(
         touch.clientX,
         touch.clientY
      );
      
      // point = point.screenToCanvas();
      
      return point;
   }
   
   function getPoints(touches) {
   
      var points = [];
      
      for (index = 0; index < touches.length; index++) {
         var touch = touches[index];
         var point = getPoint(touch);
         points.push(point);
      }
      return points;
   }
   
}
