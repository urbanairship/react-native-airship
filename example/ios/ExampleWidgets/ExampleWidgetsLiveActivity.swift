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
            // Lock screen/banner UI goes here.
            // Strings are resolved using the app's supported localizations declared
            // in Xcode (Project > Info > Localizations). The device language is only
            // used if it matches one of those declared locales; otherwise iOS falls
            // back to the development region (en). This is standard iOS behavior and
            // is not specific to the Airship SDK.
            VStack {
                Text(String(localized: "live_activity.title"))
                    .font(.headline)
                Text(String(format: String(localized: "live_activity.status"), context.state.emoji))
            }
            .activityBackgroundTint(Color.cyan)
            .activitySystemActionForegroundColor(Color.black)

        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Text(String(localized: "live_activity.title"))
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text(String(format: String(localized: "live_activity.status"), context.state.emoji))
                }
            } compactLeading: {
                Text(String(localized: "live_activity.title"))
            } compactTrailing: {
                Text(context.state.emoji)
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

