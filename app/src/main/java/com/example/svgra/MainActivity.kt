package com.example.svgra

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.Button
import android.widget.LinearLayout

class MainActivity : AppCompatActivity() {
    
    private lateinit var svgView: CustomSvgView
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Create main layout
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
        }
        
        // Create SVG view
        svgView = CustomSvgView(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                0,
                1f
            )
        }
        
        // Create button panel
        val buttonLayout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
        }
        
        // Add shape buttons
        val addCircleButton = Button(this).apply {
            text = "Add Circle"
            setOnClickListener {
                svgView.addShape("circle", 100f, 100f)
            }
        }
        
        val addRectButton = Button(this).apply {
            text = "Add Rectangle"
            setOnClickListener {
                svgView.addShape("rect", 200f, 200f, 150f, 100f)
            }
        }
        
        val clearButton = Button(this).apply {
            text = "Clear"
            setOnClickListener {
                svgView.clear()
            }
        }
        
        buttonLayout.addView(addCircleButton)
        buttonLayout.addView(addRectButton)
        buttonLayout.addView(clearButton)
        
        layout.addView(svgView)
        layout.addView(buttonLayout)
        
        setContentView(layout)
        
        // Test with a simple SVG
        val testSvg = """
            <svg width="100" height="100">
                <circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" />
            </svg>
        """.trimIndent()
        
        svgView.loadSvgFromString(testSvg)
    }
}
