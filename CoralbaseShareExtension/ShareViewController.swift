//
//  ShareViewController.swift
//  CoralbaseShareExtension
//
//  Created by Shohruh Ismatulla on 2/16/25.
//
import UIKit
import Social
import MobileCoreServices

class ShareViewController: SLComposeServiceViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Set the title of the Share Extension
        self.title = "Share to Coralbase"
    }

    override func isContentValid() -> Bool {
        // Always return true since we're not validating text input
        return true
    }

    override func didSelectPost() {
        // Handle the shared content
        guard let extensionContext = self.extensionContext else {
            self.extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
            return
        }
        
        // Iterate over the input items (shared content)
        for item in extensionContext.inputItems as! [NSExtensionItem] {
            for provider in item.attachments! {
                // Check if the item is an image
                if provider.hasItemConformingToTypeIdentifier(kUTTypeImage as String) {
                    provider.loadItem(forTypeIdentifier: kUTTypeImage as String, options: nil) { (item, error) in
                        if let imageURL = item as? URL, let imageData = try? Data(contentsOf: imageURL) {
                            // Process the image (e.g., save it or upload it)
                            self.handleImage(imageData: imageData)
                        } else if let image = item as? UIImage {
                            // Process the image directly
                            self.handleImage(imageData: image.pngData()!)
                        }
                    }
                }
                // Check if the item is a video
                else if provider.hasItemConformingToTypeIdentifier(kUTTypeMovie as String) {
                    provider.loadItem(forTypeIdentifier: kUTTypeMovie as String, options: nil) { (item, error) in
                        if let videoURL = item as? URL {
                            // Process the video (e.g., save it or upload it)
                            self.handleVideo(videoURL: videoURL)
                        }
                    }
                }
            }
        }
        
        // Notify the extension context that the task is complete
        self.extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
    }

    override func didSelectCancel() {
        // Handle cancellation
        let cancelError = NSError(domain: NSCocoaErrorDomain, code: NSUserCancelledError, userInfo: nil)
        self.extensionContext?.cancelRequest(withError: cancelError)
    }

    // MARK: - Helper Methods

    private func handleImage(imageData: Data) {
        // Save the image to the shared container
        if let sharedDefaults = UserDefaults(suiteName: "group.com.example.Coralbase") {
            sharedDefaults.set(imageData, forKey: "sharedImage")
            print("Image saved to shared container")
        }
    }

    private func handleVideo(videoURL: URL) {
        // Save the video URL to the shared container
        if let sharedDefaults = UserDefaults(suiteName: "group.com.example.Coralbase") {
            sharedDefaults.set(videoURL.absoluteString, forKey: "sharedVideo")
            print("Video URL saved to shared container")
        }
    }
}
