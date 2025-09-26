package com.example.mysvgeditor

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // We'll work with a custom view instead of XML
        setContentView(CustomSvgView(this))
    }
}
