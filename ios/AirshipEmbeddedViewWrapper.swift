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

        super.init(frame: frame)
        self.addSubview(self.viewController.view)
        self.translatesAutoresizingMaskIntoConstraints = false

        self.viewModel.size = frame.size
        NSLayoutConstraint.activate(
            [
                self.topAnchor.constraint(equalTo: self.viewController.view.topAnchor),
                self.bottomAnchor.constraint(equalTo: self.viewController.view.bottomAnchor),
                self.leadingAnchor.constraint(equalTo: self.viewController.view.leadingAnchor),
                self.trailingAnchor.constraint(equalTo: self.viewController.view.trailingAnchor),
            ]
        )
    }


    public override func layoutSubviews() {
        super.layoutSubviews()

        if  !isAdded {
            isAdded = true
            self.parentViewController().addChild(self.viewController)
        }

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
            ) {
                Text("place holder \(embeddedID) \(viewModel.size ?? CGSize())")
            }
        } else {
            Text("No id")
        }
        Text("Size \(viewModel.width)x\(viewModel.height)")
    }

    @MainActor
    class ViewModel: ObservableObject {
      @Published var embeddedID: String?
        @Published var size: CGSize?

        var height: CGFloat {
            guard let height = self.size?.height, height > 0 else {
                return try! AirshipUtils.mainWindow()?.screen.bounds.height ?? 500
            }
            return height
        }

        var width: CGFloat {
            guard let width = self.size?.width, width > 0 else {
                return try! AirshipUtils.mainWindow()?.screen.bounds.width ?? 500
            }
            return width
        }
    }

}



