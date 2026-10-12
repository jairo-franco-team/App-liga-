package mx.ligajuventino.app;

import android.content.Context;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.ProcessedRoute;
import java.io.IOException;
import java.io.InputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import org.json.JSONObject;

/** Exact-byte aliases inside the packaged APK. URLs, MIME and response handling stay in Capacitor. */
public final class LigaAssetAliases {
    private static volatile Map<String, String> aliases;

    private static Map<String, String> load(Context context) {
        Map<String, String> current = aliases;
        if (current != null) return current;
        synchronized (LigaAssetAliases.class) {
            if (aliases != null) return aliases;
            try (InputStream input = context.getAssets().open("liga-asset-aliases.json")) {
                ByteArrayOutputStream output = new ByteArrayOutputStream();
                byte[] buffer = new byte[8192];
                int count;
                while ((count = input.read(buffer)) != -1) output.write(buffer, 0, count);
                JSONObject json = new JSONObject(new String(output.toByteArray(), StandardCharsets.UTF_8));
                Map<String, String> parsed = new HashMap<>();
                Iterator<String> keys = json.keys();
                while (keys.hasNext()) {
                    String key = keys.next();
                    parsed.put(key, json.getString(key));
                }
                aliases = Collections.unmodifiableMap(parsed);
                return aliases;
            } catch (Exception error) {
                // A damaged alias manifest must be visible, rather than silently returning blank media.
                throw new IllegalStateException("Cannot load packaged Liga asset aliases", error);
            }
        }
    }

    public static InputStream open(Context context, String path) throws IOException {
        String target = load(context).get(path);
        return context.getAssets().open("public/" + (target == null ? path : target));
    }

    public static void install(BridgeActivity activity, Bridge.Builder builder) {
        final Map<String, String> paths = load(activity);
        builder.setRouteProcessor((basePath, requestPath) -> {
            Bridge bridge = activity.getBridge();
            String root = bridge == null ? "public" : bridge.getServerBasePath();
            boolean packaged = "public".equals(root);
            boolean assetRoot = !root.startsWith("/");
            String key = requestPath.startsWith("/") ? requestPath.substring(1) : requestPath;
            String canonical = packaged ? paths.get(key) : null;
            String resolved = canonical == null ? requestPath : "/" + canonical;
            ProcessedRoute route = new ProcessedRoute();
            // These branches are handled directly by Capacitor's content/file protocol handler.
            boolean devicePath = requestPath.startsWith("/_capacitor_file_") || requestPath.startsWith("/_capacitor_content_");
            route.setPath(devicePath ? requestPath : assetRoot ? basePath + resolved : root + resolved);
            route.setAsset(assetRoot);
            route.setIgnoreAssetPath(false);
            return route;
        });
    }
}
