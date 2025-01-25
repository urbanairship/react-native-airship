//
//  ExampleWidgetsLiveActivity.swift
//  ExampleWidgets
//

import ActivityKit
import WidgetKit
import SwiftUI


struct ExampleWidgetsLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: ExampleWidgetsAttributes.self) { context in
            // Lock screen/banner UI goes here
            VStack {
                Text("Hello \(context.state.emoji)")
            }
            .activityBackgroundTint(Color.cyan)
            .activitySystemActionForegroundColor(Color.black)

        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded UI goes here.  Compose the expanded UI through
                // various regions, like leading/trailing/center/bottom
                DynamicIslandExpandedRegion(.leading) {
                    Text("Leading")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("Trailing")
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text("Bottom \(context.state.emoji)")
                    // more content
                }
            } compactLeading: {
                Text("L")
            } compactTrailing: {
                Text("T \(context.state.emoji)")
            } minimal: {
                Text(context.state.emoji)
            }
            .widgetURL(URL(string: "http://www.apple.com"))
            .keylineTint(Color.red)
        }
    }
}

extension ExampleWidgetsAttributes {
    fileprivate static var preview: ExampleWidgetsAttributes {
        ExampleWidgetsAttributes(name: "World")
    }
}

extension ExampleWidgetsAttributes.ContentState {
    fileprivate static var smiley: ExampleWidgetsAttributes.ContentState {
        ExampleWidgetsAttributes.ContentState(emoji: "😀")
     }
     
     fileprivate static var starEyes: ExampleWidgetsAttributes.ContentState {
         ExampleWidgetsAttributes.ContentState(emoji: "🤩")
     }
}

