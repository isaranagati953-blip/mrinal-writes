(async () => {
  const res = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "isaranagati953@email.com", password: "iS@ran@gat!953#" })
  });
  console.log("Status:", res.status);
  console.log("Body:", await res.json());
})();
