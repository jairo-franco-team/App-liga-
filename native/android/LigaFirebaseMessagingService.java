package mx.ligajuventino.app;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import java.util.Map;

/**
 * Receptor opcional, compilado solo con configuración Firebase válida.
 * La auto-inicialización FCM queda deshabilitada en el Manifest. No se crea,
 * registra, guarda ni envía token alguno desde este servicio.
 * El alta de dispositivos exige un flujo posterior de consentimiento.
 */
public final class LigaFirebaseMessagingService extends FirebaseMessagingService {
    private static final String CHANNEL = "liga_partidos";

    @Override
    public void onMessageReceived(@NonNull RemoteMessage message) {
        Map<String,String> data = message.getData();
        if (!"official".equals(data.get("type")) || !"notifications".equals(data.get("route"))) return;
        if (Build.VERSION.SDK_INT >= 33 &&
            checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return;

        RemoteMessage.Notification payload = message.getNotification();
        String title = payload == null ? data.get("title") : payload.getTitle();
        String body = payload == null ? data.get("body") : payload.getBody();
        if (title == null || title.isBlank() || body == null || body.isBlank()) return;
        title = title.length() > 120 ? title.substring(0, 120) : title;
        body = body.length() > 700 ? body.substring(0, 700) : body;
        NotificationManager manager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        if (manager == null) return;
        if (Build.VERSION.SDK_INT >= 26 && manager.getNotificationChannel(CHANNEL) == null) {
            NotificationChannel channel = new NotificationChannel(CHANNEL, "Liga Juventino",
                NotificationManager.IMPORTANCE_HIGH);
            manager.createNotificationChannel(channel);
        }

        Intent open = new Intent(this, MainActivity.class);
        open.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        open.putExtra("ljr_route", "notifications");
        PendingIntent tap = PendingIntent.getActivity(this, 18041, open,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        NotificationCompat.Builder notification = new NotificationCompat.Builder(this, CHANNEL)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title).setContentText(body)
            .setAutoCancel(true).setContentIntent(tap)
            .setPriority(NotificationCompat.PRIORITY_HIGH);
        String id = data.get("noticeId");
        manager.notify(id == null ? 18041 : id.hashCode(), notification.build());
    }

    @Override
    public void onNewToken(@NonNull String token) {
        // No loguear, almacenar ni remitir tokens antes del consentimiento
        // y de disponer de una API autenticada para altas y bajas.
    }
}
