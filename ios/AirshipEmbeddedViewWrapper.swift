/* Copyright Airship and Contributors */

import Foundation
import AirshipKit
import AirshipFrameworkProxy
import SwiftUI

@objc(RNAirshipEmbeddedViewWrapper)
public final class AirshipEmbeddedViewWrapper: UIView {
    private let viewModel = ReactAirshipEmbeddedView.ViewModel()
    @objc
    public let viewController: UIViewController
    public var isAdded: Bool = false

    @objc(setEmbeddedID:)
    public func setEmbeddedID(_ embeddedID: String?) {
        self.viewModel.embeddedID = embeddedID
    }

    @objc(setSelectionType:)
    public func setSelectionType(_ selectionType: String?) {
        self.viewModel.selectionType = selectionType
    }

    @objc(setSelectionInstanceId:)
    public func setSelectionInstanceId(_ selectionInstanceId: String?) {
        self.viewModel.selectionInstanceId = selectionInstanceId
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    @objc
    public override init(frame: CGRect) {
        self.viewController = UIHostingController(
            rootView: ReactAirshipEmbeddedView(viewModel: self.viewModel)
        )

        self.viewController.view.backgroundColor = UIColor.clear

        super.init(frame: frame)
        self.translatesAutoresizingMaskIntoConstraints = false
        self.addSubview(self.viewController.view)
        self.viewController.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]

        self.viewModel.size = frame.size
    }

    public override func didMoveToWindow() {
        super.didMoveToWindow()

        if self.window == nil {
            if self.isAdded {
                self.viewController.willMove(toParent: nil)
                self.viewController.removeFromParent()
                self.isAdded = false
            }
            return
        }

        guard !self.isAdded, let parentVC = self.parentViewController() else { return }
        self.viewController.willMove(toParent: parentVC)
        parentVC.addChild(self.viewController)
        self.viewController.didMove(toParent: parentVC)
        self.viewController.view.isUserInteractionEnabled = true
        isAdded = true
    }

    public override func layoutSubviews() {
        super.layoutSubviews()
        self.viewModel.size = bounds.size
    }
}

extension UIView {
    func parentViewController() -> UIViewController? {
        var responder: UIResponder? = self
        while let r = responder {
            if let vc = r as? UIViewController {
                return vc
            }
            responder = r.next
        }
        return nil
    }
}

import SwiftUI

struct ReactAirshipEmbeddedView: View {
  @ObservedObject var viewModel: ViewModel
    var body: some View {

        if let embeddedID = viewModel.embeddedID {
            AirshipEmbeddedView(embeddedID: embeddedID,
                embeddedSize: .init(
                    parentWidth: viewModel.width,
                    parentHeight: viewModel.height
                ),
                selection: viewModel.selection
            )
        }
    }

    @MainActor
    class ViewModel: ObservableObject {
      @Published var embeddedID: String?
        @Published var size: CGSize?
        @Published var selectionType: String?
        @Published var selectionInstanceId: String?

        var selection: AirshipEmbeddedSelection {
            if selectionType == "instance_id", let selectionInstanceId {
                return .instance(selectionInstanceId)
            }
            return .priority
        }

        var height: CGFloat {
            guard let height = self.size?.height, height > 0 else {
                return (try? AirshipUtils.mainWindow()?.screen.bounds.height) ?? 500
            }
            return height
        }

        var width: CGFloat {
            guard let width = self.size?.width, width > 0 else {
                return (try? AirshipUtils.mainWindow()?.screen.bounds.width) ?? 500
            }
            return width
        }
    }

}



