/* Copyright Airship and Contributors */

import Foundation
import AirshipKit
import AirshipFrameworkProxy
import SwiftUI

@objc(RTNAirshipEmbeddedViewWrapper)
public final class AirshipEmbeddedViewWrapper: UIView {
    private let viewModel = ReactAirshipEmbeddedView.ViewModel()
    @objc
    public let viewController: UIViewController
    public var isAdded: Bool = false

    @objc(setEmbeddedID:)
    public func setEmbeddedID(_ embeddedID: String?) {
        self.viewModel.embeddedID = embeddedID
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
        guard !self.isAdded else { return }
        self.viewController.willMove(toParent: self.parentViewController())
        self.parentViewController().addChild(self.viewController)
        self.viewController.didMove(toParent: self.parentViewController())
        self.viewController.view.isUserInteractionEnabled = true
        isAdded = true
    }

    public override func layoutSubviews() {
        super.layoutSubviews()
        self.viewModel.size = bounds.size
    }
}

extension UIView
{
    //Get Parent View Controller from any view
    func parentViewController() -> UIViewController {
        var responder: UIResponder? = self
        while !(responder is UIViewController) {
            responder = responder?.next
            if nil == responder {
                break
            }
        }
        return (responder as? UIViewController)!
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
                )
            )
        }
    }

    @MainActor
    class ViewModel: ObservableObject {
      @Published var embeddedID: String?
        @Published var size: CGSize?

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



