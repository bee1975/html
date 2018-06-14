function Drawing(parent) {

   this.lines = [];
   this.f = null;
   this.statement = null;
   this.drawings = [];
   this.parent = parent;
   
   var dimensions = null;
   
   this.draw = function(context) {
   
      if (canvas.selected == this)
         context.strokeStyle = "blue";
      else {
         if (this.f)
            context.strokeStyle = "green";
         else
            context.strokeStyle = "red";
      }
      
      this.lines.forEach(
         function(line) {
            context.beginPath();
             context.moveTo(line.start.x, line.start.y);
            
            line.draw(context);
            
         }
      );
      
      if (this.f) {
         drawStatement(
            this.getDimensions(),
            this.statement,
            context
         );
      }
         
      this.drawings.forEach(
         function (drawing) {
            drawing.draw(context);
         }
      );
   
      function drawStatement(dimensions, statement, context) {

         var textWidth = context.measureText(statement).width;
         var dim = dimensions;
         
         var x = dim.left + dim.width / 2 - textWidth / 2;
         
         var y = dim.top + dim.height / 2 - context.textHeight / 2;
         
         debug.add("drawStatement",
            new Point(x, y).round()
         );

         context.fillText(statement, x, y);
         
      }

   }

   
   this.setStatement = function(statement) {
   
      canvas.selected = this;
      draw();
      
      if (statement == undefined)
         statement = this.statement;
      
      if (statement == null)
         statement = "";
         
      var f = null;
   
      while (f == null) {
      
         statement = prompt("f", statement);
      
         if (statement == null)
            return false;

         try {
            f = new Function(statement);
         }
         catch(error) {
            alert(error);
         }
         
      }
      
      this.statement = statement;
      this.f = f;
      canvas.selected = null;
      draw();
      return true;

   }
   
   this.hitTest = function(point) {
      var dim = this.getDimensions();
      if (dim.isPointInside(point)) {
         for (var index in this.drawings) {
            var drawing = this.drawings[index];
            var hit = drawing.hitTest(point);
            if (hit)
               return hit;
         }
         return this;
      }
      return null;
   }   

   this.click = function(point) {
       if (this.f)
          try {
             this.f();
          }
          catch (error) {
             alert(error);
          }
       else {
          this.setStatement();
       }
       
   }
   
   this.longClick = function(point) {
       this.setStatement();
   }
   
   this.getDimensions = function() {
   
      if (dimensions != null)
         return dimensions;
         
      var minimum = new Point(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);

      var maximum = new Point(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);

      this.lines.forEach(
         function (line) {
     
            var lineDim = line.getDimensions();

            minimum = lineDim.minimum.minimum(minimum);

            maximum = lineDim.maximum.maximum(maximum);

         }
      );
      
      dimensions = new Dimensions(
         minimum,
         maximum
      );

      return dimensions;
      
   }
   
   this.clearDimensions = function() {
      dimensions = null;
   }
   

}


function Point(x, y) {

   this.x = x;
   this.y = y;
  
   debug.add("Point",
      {
         x: x,
         y: y
      }
   );
   
   this.offset = function(offset) {
      return new Point(
         this.x + offset.x,
         this.y + offset.y
      );
   }
   
   this.scale = function(scale) {
      return new Point(
         this.x * scale,
         this.y * scale
      );
   }
   
   this.negative = function() {
      return new Point(
         -this.x,
         -this.y
      );
   }
   
   this.minimum = function(point) {
      return new Point(
         this.x <= point.x ? this.x : point.x,
         this.y <= point.y ? this.y : point.y
      );
   }

   this.maximum = function(point) {
      debug.add("maximum",
         {
            _this: this,
            point: point
         }
      );
    
      return new Point(
         (this.x >= point.x) ?
            this.x : point.x,
         (this.y >= point.y) ?
            this.y : point.y
      );
   }

   this.distance = function(point) {
      var dx = this.x - point.x;
      var dy = this.y - point.y;
      return Math.sqrt(dx * dx + dy * dy);
   }

   this.middle = function(point) {
      return new Point(
         (this.x + point.x) / 2,
         (this.y + point.y) / 2
      );
   }
   
   this.transform = function(matrix) {
      
      var transformed = matrix.multiply(
         [
            [this.x],
            [this.y],
            [1]
         ]
      );
   
      return new Point(
         transformed.m[0][0],
         transformed.m[1][0]
      );
   }
   
   this.round = function() {
      return new Point(
         Math.round(this.x),
         Math.round(this.y)
      );
   }
   
   this.equals = function(point) {
      return (this.x == point.x &&
              this.y == point.y);
   }
   
   this.screenToCanvas = function() {
      return this.transform(canvas.inverse);

   }

   this.toString = function() {
      return "{x:" + this.x + ", y:" + this.y + "}";
   }
   
}

function Dimensions(min, max) {
   this.minimum = min;
   this.maximum = max;

   this.isPointInside = function(point) {
      return point.x >= this.minimum.x
         && point.x <= this.maximum.x
         && point.y >= this.minimum.y
         && point.y <= this.maximum.y;
   }
   
   this.round = function() {
      return new Dimensions(
         this.minimum.round(),
         this.maximum.round()
      );
   }
   
   this.contains = function(dimension) {
      return (this.left <= dimension.left
         && this.right >= dimension.right
         && this.top <= dimension.top
         && this.bottom >= dimension.bottom);
   }
   
   this.left = this.minimum.x;
   this.top = this.minimum.y;
   
   this.width = this.maximum.x - this.minimum.x;
   
   this.height = this.maximum.y - this.minimum.y;
   
   this.right = this.left + this.width;
   this.bottom = this.top + this.height;
}

function Line(start) {

   this.start = start;
  
   this.points = [];
   
   var dimensions = null;
   
   this.getDimensions = function() {
   
      if (dimensions)
         return dimensions;
      
      var minimum = this.start;
   
      var maximum = this.start;

      this.points.forEach(
         function(point) {
     
            minimum = point.minimum(minimum);
      
            maximum = point.maximum(maximum);
         }
      );
      
      dimensions = new Dimensions(
         minimum,
         maximum
      );
      
      return dimensions;
   }

   this.clearDimensions = function() {
      dimensions = null;
   }
   
   
   this.draw = function(context) {
   
      this.points.forEach(
         function(point) {
      
            context.lineTo(point.x, point.y);
         }
      );
      
      context.stroke();

   }
   

}

function Matrix(matrix) {

   this.m = matrix;
   
   // multiply two 2d matrices
   this.multiply = function(matrix) {
   
      // get the raw arrays
      var m1 = this.m;
      var m2;
      if (matrix.constructor == Matrix)
         m2 = matrix.m;
      else
         m2 = matrix;
         
      var result = [];
      
      for (var i = 0; i < m1.length; i++) {
         result[i] = [];
         for (var j = 0; j < m2[0].length; j++) {
         
            var sum = 0;
            
            for (var k = 0; k < m1[0].length; k++)
               sum += m1[i][k] * m2[k][j];
            
            result[i][j] = sum;
         }
      }
      
      return new Matrix(result);
   }
   
   this.toString = function() {
      var a = this.matrix;
      var strBuff = [];
      for (var i = 0; i < a.length; i ++) {
         var row = a[i];
         strBuff.push("[" + row + "]");
         
      }
      
      return "[" + strBuff.join("\n") + "]";
   }
      
}
