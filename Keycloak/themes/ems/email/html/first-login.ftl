<#-- HTML version -->
<html>
  <body style="font-family:Arial,Helvetica,sans-serif; font-size:14px;">
    <p>Hi <b>${(username)!'user'}</b>,</p>

    <p><b>First login into ${realmName}</b> was just completed.</p>

    <p>
      Device: ${userAgent!''}<br/>
      IP: ${ip!''}
      <#if city?? || country??>
        <br/>Approx. location: ${city!''}<#if city?? && country??>, </#if>${country!''}
      </#if>
    </p>

    <p>If this wasn’t you, please reset your password immediately or contact support.</p>

    <p>— EMS Team</p>
  </body>
</html>
