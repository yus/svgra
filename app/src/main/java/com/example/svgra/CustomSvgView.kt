package com.example.svgra

import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.RectF
import android.util.AttributeSet
import android.view.View
import com.caverock.androidsvg.SVG
import com.caverock.androidsvg.SVGParseException

class CustomSvgView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private val paint = Paint().apply {
        color = 0xFF2196F3.toInt()  // Blue color
        style = Paint.Style.FILL
        isAntiAlias = true
    }
    
    private var currentSvg: SVG? = null
    private val shapes = mutableListOf<SvgShape>()
    
    // Simple shape data class
    data class SvgShape(
        val type: String,
        val x: Float,
        val y: Float,
        val width: Float,
        val height: Float,
        val color: Int
    )

    // Load SVG from string
    fun loadSvgFromString(svgContent: String) {
        try {
            currentSvg = SVG.getFromString(svgContent)
            invalidate() // Redraw view
        } catch (e: SVGParseException) {
            // Handle parsing error
            e.printStackTrace()
        }
    }
    
    // Add a simple shape
    fun addShape(type: String, x: Float, y: Float, width: Float = 100f, height: Float = 100f) {
        val colors = listOf(0xFF2196F3, 0xFF4CAF50, 0xFFFFC107, 0xFFF44336)
        val color = colors[shapes.size % colors.size].toInt()
        
        shapes.add(SvgShape(type, x, y, width, height, color))
        invalidate()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        
        // Draw background
        canvas.drawColor(0xFFFAFAFA.toInt())
        
        // Draw stored shapes
        shapes.forEach { shape ->
            paint.color = shape.color
            when (shape.type) {
                "circle" -> canvas.drawCircle(
                    shape.x + shape.width / 2,
                    shape.y + shape.height / 2,
                    shape.width / 2,
                    paint
                )
                "rect" -> canvas.drawRect(
                    shape.x,
                    shape.y,
                    shape.x + shape.width,
                    shape.y + shape.height,
                    paint
                )
            }
        }
        
        // Draw SVG if loaded
        currentSvg?.let { svg ->
            val scale = 1.0f // You can add scaling logic here
            canvas.save()
            canvas.scale(scale, scale)
            svg.renderToCanvas(canvas)
            canvas.restore()
        }
    }
    
    // Clear all shapes
    fun clear() {
        shapes.clear()
        currentSvg = null
        invalidate()
    }
}
