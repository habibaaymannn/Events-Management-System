<!doctype html>
<html>
  <body>
    <p>Admin has created an account for you.</p>
    <p>
      Username: <strong>${user.username}</strong><br/>
      A temporary password was set by the admin. Use the link below to set your own password for future logins.
    </p>
    <p>
      <a href="${link}">Set your password</a> (expires in ${linkExpiration}).
    </p>
    <hr/>
    <small>${realmName}</small>
  </body>
</html>
