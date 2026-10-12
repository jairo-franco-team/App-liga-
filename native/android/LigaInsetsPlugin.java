package mx.ligajuventino.app;

import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Physical system bars translated to CSS pixels; artwork stays edge-to-edge. */
@CapacitorPlugin(name = "LigaInsets")
public class LigaInsetsPlugin extends Plugin {
    @PluginMethod
    public void getInsets(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            WindowInsetsCompat window = ViewCompat.getRootWindowInsets(getActivity().getWindow().getDecorView());
            if (window == null) {
                getActivity().getWindow().getDecorView().postDelayed(() -> getInsets(call), 16);
                return;
            }
            Insets bars = window.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
            float density = getContext().getResources().getDisplayMetrics().density;
            JSObject result = new JSObject();
            result.put("top", bars.top / density);
            result.put("bottom", bars.bottom / density);
            result.put("left", bars.left / density);
            result.put("right", bars.right / density);
            call.resolve(result);
        });
    }
}
