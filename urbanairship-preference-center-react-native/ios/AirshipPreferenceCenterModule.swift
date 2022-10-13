/* Copyright Urban Airship and Contributors */

import Foundation
import UserNotifications
import AirshipKit

@objc(AirshipPreferenceCenterModule)
class AirshipPreferenceCenterModule: NSObject, PreferenceCenterOpenDelegate {
    
    let UARCTOpenPreferenceCenterEventName = "com.urbanairship.open_preference_center"

    
    static func moduleName() -> String! {
        return "AirshipPreferenceCenterModule"
    }
    
    @objc var methodQueue: DispatchQueue? {
        return DispatchQueue.main
    }
    
    
    override init() {
        super.init()
        if (Airship.isFlying) {
            onAirshipReady()
        } else {
            NotificationCenter.default.addObserver(self, selector: #selector(onAirshipReady), name: Airship.airshipReadyNotification, object: nil)
        }
    }
    
    @objc
    func open(_ preferenceCenterId: String) {
        if (!Airship.isFlying) {
            return
        }
        
        PreferenceCenter.shared.open(preferenceCenterId)
    }
    
    @objc
    func setUseCustomPreferenceCenterUi(_ useCustomUi: Bool, forPreferenceId preferenceId: String) {
        UARCTStorage.setAutoLaunch(!useCustomUi, preferencesForID: preferenceId)
    }
    
    @objc
    func getConfiguration(_ preferenceCenterId: String, resolver resolve:@escaping RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        if (!Airship.isFlying) {
            reject("TAKE_OFF_NOT_CALLED", "Airship not ready, takeOff not called", nil)
            return
        }
        
        var form: [String : Any]?
        let remoteData = Airship.component(ofType: RemoteDataManager.self)
        let disposable = remoteData?.subscribe(types: ["preference_forms"], block: { payloads in
            guard let forms = payloads.first?.data["preference_forms"] as? [[String : Any]] else {
                return
            }
            //TODO comment set le result si first est true
            form = forms
                            .compactMap { $0["form"] as? [String : Any] }
                            .first(where: { $0["id"] as? String == preferenceCenterId})
        
        })
        if (form != nil) {
            resolve(form)
        }
        
        disposable?.dispose()
        
    }
    
    @objc func onAirshipReady() {
        PreferenceCenter.shared.openDelegate = self
    }
    
    func openPreferenceCenter(_ preferenceCenterID: String) -> Bool {
        if (UARCTStorage.autoLaunchPreferences(forID: preferenceCenterID)) {
            return false
        }
        
        UARCTEventEmitter.shared()?.sendEvent(withName: UARCTOpenPreferenceCenterEventName, body: [
            "preferenceCenterId": preferenceCenterID
        ])
        
        return true
    }
    
}
