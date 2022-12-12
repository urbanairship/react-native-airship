import Foundation
import Combine

actor PendingEvents {
    private let updateContinuation: AsyncStream<Void>.Continuation
    let pendingEventUpdates: AsyncStream<Void>

    static let shared = PendingEvents()

    init() {
        var escapee: AsyncStream<Void>.Continuation!
        self.pendingEventUpdates = AsyncStream { continuation in
            escapee = continuation
        }
        self.updateContinuation = escapee
    }

    private var eventMap: [String: [Event]] = [:]

    func hasEvent(forName name: String) -> Bool {
        return eventMap[name]?.isEmpty == false
    }

    func takeEvents(forName name: String) -> [Event] {
        let result = eventMap[name]
        eventMap[name] = []
        return result ?? []
    }

    func addEvent(_ event: Event) {
        if eventMap[event.name] == nil {
            eventMap[event.name] = []
        }
        eventMap[event.name]?.append(event)

        updateContinuation.yield()
    }
}
