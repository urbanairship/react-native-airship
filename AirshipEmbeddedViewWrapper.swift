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

        self.viewModel.size = frame.size
        super.init(frame: frame)
        self.viewController.view.frame = bounds
        self.addSubview(self.viewController.view)
    }



    public override func layoutSubviews() {
        super.layoutSubviews()
        self.viewController.view.frame = bounds
        self.viewModel.size = bounds.size

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
                    parentWidth: viewModel.size?.width,
                    parentHeight: viewModel.size?.height
                )
            ) {
                Text("place holder \(embeddedID) \(viewModel.size ?? CGSize())")
            }
            .frame(width: self.viewModel.size?.width, height: self.viewModel.size?.height)
            .clipped()
        } else {
            Text("No id")
        }

    }

    class ViewModel: ObservableObject {
      @Published var embeddedID: String?
        @Published var size: CGSize?
    }
    
}



