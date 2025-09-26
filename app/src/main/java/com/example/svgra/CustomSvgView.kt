// Create new Kotlin file: CustomSvgView.kt
import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.view.View

class CustomSvgView(context: Context) : View(context) {
    private val paint = Paint().apply {
        color = 0xFF2196F3.toInt()  // Blue color
        style = Paint.Style.FILL
    }
    
    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        
        // Draw a simple circle (our first SVG-like shape!)
        canvas.drawCircle(width / 2f, height / 2f, 200f, paint)
        
        // Draw a rectangle
        paint.color = 0xFF4CAF50.toInt()  // Green
        canvas.drawRect(100f, 100f, 400f, 300f, paint)
    }
}
