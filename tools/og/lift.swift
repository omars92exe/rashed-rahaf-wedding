// Lift the people out of a photo with Apple's Vision subject lifting (macOS 14+).
// usage: swift tools/og/lift.swift in.png out-mask.png   -> a greyscale mask, white = subject
import Foundation
import Vision
import CoreImage
import AppKit

let args = CommandLine.arguments
let input = URL(fileURLWithPath: args[1]), output = URL(fileURLWithPath: args[2])
let handler = VNImageRequestHandler(url: input)
let request = VNGenerateForegroundInstanceMaskRequest()
try handler.perform([request])
guard let result = request.results?.first else { print("no subject found"); exit(1) }
let buffer = try result.generateScaledMaskForImage(forInstances: result.allInstances, from: handler)
let ci = CIImage(cvPixelBuffer: buffer)
let ctx = CIContext()
guard let cg = ctx.createCGImage(ci, from: ci.extent) else { exit(1) }
let rep = NSBitmapImageRep(cgImage: cg)
try rep.representation(using: .png, properties: [:])!.write(to: output)
print("mask", cg.width, "x", cg.height, "instances", result.allInstances.count)
