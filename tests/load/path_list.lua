function file_exists(file)
  local f = io.open(file, "rb")
  if f then f:close() end
  return f ~= nil
end

function lines_from(file)
  if not file_exists(file) then return {} end
  lines = {}
  for line in io.lines(file) do
    lines[#lines + 1] = line
  end
  return lines
end

paths = lines_from(os.getenv("WRK2_PATH_LIST"))
if #paths <= 0 then
  print("No requests found!")
  os.exit(1)
end

math.randomseed(os.time())

request = function()
  local n = #paths
  local i = math.random(n)
  path = paths[i]
  return wrk.format(nil, path)
end

done = function(summary, latency, requests)
  local requests_per_sec = (summary.requests / summary.duration) * 1e6;
  local bytes_per_sec = (summary.bytes / summary.duration) * 1e6;

  io.write("\nJSON Output:\n")
  io.write("{\n")
  io.write(string.format("  \"requests\": %d,\n", summary.requests))
  io.write(string.format("  \"duration\": %0.2f,\n", summary.duration))
  io.write(string.format("  \"bytes\": %d,\n", summary.bytes))
  io.write(string.format("  \"requests_per_sec\": %0.2f,\n", requests_per_sec))
  io.write(string.format("  \"bytes_per_sec\": %0.2f,\n", bytes_per_sec))

  io.write("  \"errors\": {\n")
  io.write(string.format("    \"connect\": %d,\n", summary.errors.connect));
  io.write(string.format("    \"read\": %d,\n", summary.errors.read));
  io.write(string.format("    \"write\": %d,\n", summary.errors.write));
  io.write(string.format("    \"status\": %d,\n", summary.errors.status));
  io.write(string.format("    \"timeout\": %d\n", summary.errors.timeout));
  io.write("  },\n");

  io.write("  \"latency\": [\n")
  for _, p in pairs({ 50, 75, 90, 95, 99, 99.5, 99.9, 100 }) do
    n = latency:percentile(p)
    io.write(string.format("    [%g, %d]", p, n))
    if p == 100 then
      io.write("\n")
    else
      io.write(",\n")
    end
  end
  io.write("  ]\n}\n")
end
