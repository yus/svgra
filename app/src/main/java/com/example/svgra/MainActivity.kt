package com.example.svgra

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Create a basic SVG-capable view
        val svgView = CustomSvgView(this)
        setContentView(svgView)
    }
}
