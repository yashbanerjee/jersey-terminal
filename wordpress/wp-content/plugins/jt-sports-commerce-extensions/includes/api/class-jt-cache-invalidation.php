<?php

if (!defined('ABSPATH')) {
    exit;
}

class JT_Cache_Invalidation
{
    public static function init(): void
    {
        // hooked via JT_Webhooks
    }

    public static function notify(array $payload): void
    {
        $url = (string) get_option('jt_sports_revalidate_url', getenv('JT_REVALIDATE_URL') ?: '');
        if (!$url) {
            return;
        }
        $ok = self::send($payload, $url);
        if (!$ok) {
            $queue = get_option('jt_sports_failed_webhooks', []);
            if (!is_array($queue)) {
                $queue = [];
            }
            $queue[] = [
                'url' => $url,
                'payload' => $payload,
                'at' => gmdate('c'),
            ];
            // keep last 100
            $queue = array_slice($queue, -100);
            update_option('jt_sports_failed_webhooks', $queue, false);
        }
    }

    public static function send(array $payload, string $url): bool
    {
        if (!$url) {
            return false;
        }
        $secret = (string) get_option('jt_sports_revalidate_secret', getenv('REVALIDATE_SECRET') ?: '');
        $body = wp_json_encode([
            'tags' => $payload['tags'] ?? ['products'],
            'topic' => $payload['topic'] ?? 'unknown',
            'id' => $payload['id'] ?? null,
        ]);

        $response = wp_remote_post($url, [
            'headers' => [
                'Content-Type' => 'application/json',
                'x-revalidate-secret' => $secret,
            ],
            'body' => $body,
            'timeout' => 10,
        ]);

        if (is_wp_error($response)) {
            return false;
        }
        $code = wp_remote_retrieve_response_code($response);
        return $code >= 200 && $code < 300;
    }
}
