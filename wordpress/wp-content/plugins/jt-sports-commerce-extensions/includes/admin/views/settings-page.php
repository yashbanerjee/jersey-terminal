<?php
if (!defined('ABSPATH')) {
    exit;
}
?>
<div class="wrap">
  <h1>JT Sports Commerce</h1>
  <p>Manage personalization, Stripe headless connector, and courier settings. Products and orders stay in WooCommerce. Cash on Delivery is disabled storewide.</p>
  <form method="post" action="options.php">
    <?php settings_fields('jt_sports_settings'); ?>
    <h2>Storefront &amp; Security</h2>
    <table class="form-table">
      <tr><th>Storefront Origin</th><td><input class="regular-text" name="jt_sports_storefront_origin" value="<?php echo esc_attr(get_option('jt_sports_storefront_origin', '')); ?>" /></td></tr>
      <tr><th>Revalidate URL</th><td><input class="regular-text" name="jt_sports_revalidate_url" value="<?php echo esc_attr(get_option('jt_sports_revalidate_url', '')); ?>" /></td></tr>
      <tr><th>Revalidate Secret</th><td><input class="regular-text" type="password" name="jt_sports_revalidate_secret" value="<?php echo esc_attr(get_option('jt_sports_revalidate_secret', '')); ?>" /></td></tr>
      <tr><th>Internal API Secret</th><td><input class="regular-text" type="password" name="jt_sports_internal_api_secret" value="<?php echo esc_attr(get_option('jt_sports_internal_api_secret', '')); ?>" /></td></tr>
      <tr><th>Currency</th><td><input name="jt_sports_currency" value="<?php echo esc_attr(get_option('jt_sports_currency', 'AED')); ?>" /></td></tr>
    </table>

    <h2>Stripe (headless connector fallback)</h2>
    <table class="form-table">
      <tr><th>Publishable Key</th><td><input class="regular-text" name="jt_sports_stripe_publishable_key" value="<?php echo esc_attr(get_option('jt_sports_stripe_publishable_key', getenv('STRIPE_PUBLISHABLE_KEY') ?: '')); ?>" /></td></tr>
      <tr><th>Secret Key</th><td><input class="regular-text" type="password" name="jt_sports_stripe_secret_key" value="<?php echo esc_attr(get_option('jt_sports_stripe_secret_key', getenv('STRIPE_SECRET_KEY') ?: '')); ?>" /></td></tr>
      <tr><th>Webhook Secret</th><td><input class="regular-text" type="password" name="jt_sports_stripe_webhook_secret" value="<?php echo esc_attr(get_option('jt_sports_stripe_webhook_secret', getenv('STRIPE_WEBHOOK_SECRET') ?: '')); ?>" /></td></tr>
    </table>

    <h2>Personalization (name &amp; number)</h2>
    <table class="form-table">
      <tr><th>Enabled by default</th><td><input type="hidden" name="jt_sports_personalization_default" value="no" /><label><input type="checkbox" name="jt_sports_personalization_default" value="yes" <?php checked(get_option('jt_sports_personalization_default', 'yes'), 'yes'); ?> /> Collect name &amp; number on every product unless disabled per product</label></td></tr>
      <tr><th>Default fee (AED)</th><td><input name="jt_sports_personalization_fee" value="<?php echo esc_attr(get_option('jt_sports_personalization_fee', '25.00')); ?>" /> <span class="description">Set 0 to include printing for free.</span></td></tr>
    </table>

    <h2>Couriers</h2>
    <table class="form-table">
      <tr><th>Aramex Username</th><td><input class="regular-text" name="jt_sports_aramex_username" value="<?php echo esc_attr(get_option('jt_sports_aramex_username', getenv('ARAMEX_USERNAME') ?: '')); ?>" /></td></tr>
      <tr><th>Aramex Password</th><td><input class="regular-text" type="password" name="jt_sports_aramex_password" value="<?php echo esc_attr(get_option('jt_sports_aramex_password', getenv('ARAMEX_PASSWORD') ?: '')); ?>" /></td></tr>
      <tr><th>Aramex Account</th><td><input class="regular-text" name="jt_sports_aramex_account_number" value="<?php echo esc_attr(get_option('jt_sports_aramex_account_number', getenv('ARAMEX_ACCOUNT_NUMBER') ?: '')); ?>" /></td></tr>
      <tr><th>Aramex PIN</th><td><input class="regular-text" type="password" name="jt_sports_aramex_account_pin" value="<?php echo esc_attr(get_option('jt_sports_aramex_account_pin', '')); ?>" /></td></tr>
      <tr><th>DHL API Key</th><td><input class="regular-text" name="jt_sports_dhl_api_key" value="<?php echo esc_attr(get_option('jt_sports_dhl_api_key', getenv('DHL_API_KEY') ?: '')); ?>" /></td></tr>
      <tr><th>DHL API Secret</th><td><input class="regular-text" type="password" name="jt_sports_dhl_api_secret" value="<?php echo esc_attr(get_option('jt_sports_dhl_api_secret', getenv('DHL_API_SECRET') ?: '')); ?>" /></td></tr>
      <tr><th>DHL Account</th><td><input class="regular-text" name="jt_sports_dhl_account_number" value="<?php echo esc_attr(get_option('jt_sports_dhl_account_number', '')); ?>" /></td></tr>
      <tr><th>Customs</th><td>
        <select name="jt_sports_customs_arrangement">
          <option value="DAP" <?php selected(get_option('jt_sports_customs_arrangement', 'DAP'), 'DAP'); ?>>DAP (duties payable by customer)</option>
          <option value="DDP" <?php selected(get_option('jt_sports_customs_arrangement', 'DAP'), 'DDP'); ?>>DDP (duties included)</option>
        </select>
      </td></tr>
    </table>
    <?php submit_button('Save JT Sports settings'); ?>
  </form>
</div>
