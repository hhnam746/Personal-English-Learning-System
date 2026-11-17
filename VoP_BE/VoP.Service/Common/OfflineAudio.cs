using System.Diagnostics;
using System.Text.RegularExpressions;

namespace VoP.Service.Common;

public sealed class OfflineAudio(bool speechEnabled)
{
    public bool CanSpeak => speechEnabled && OperatingSystem.IsMacOS() && File.Exists("/usr/bin/say");

    public static bool IsLocalPath(string? path) => path != null &&
        Regex.IsMatch(path, @"^/audio/[a-zA-Z0-9_-]+\.(mp3|wav|ogg)$", RegexOptions.IgnoreCase);

    public async Task<byte[]?> Speak(string term, CancellationToken ct)
    {
        if (!CanSpeak) return null;
        var path = Path.Combine(Path.GetTempPath(), $"recall-{Guid.NewGuid():N}.wav");
        var info = new ProcessStartInfo("/usr/bin/say") { RedirectStandardInput = true };
        foreach (var arg in new[] { "-v", "Samantha", "-o", path, "--file-format=WAVE", "--data-format=LEI16@22050", "-f", "-" })
            info.ArgumentList.Add(arg);
        using var timeout = CancellationTokenSource.CreateLinkedTokenSource(ct);
        timeout.CancelAfter(TimeSpan.FromSeconds(6));
        using var process = Process.Start(info);
        if (process == null) return null;
        try
        {
            await process.StandardInput.WriteAsync(term.AsMemory(), timeout.Token);
            process.StandardInput.Close();
            await process.WaitForExitAsync(timeout.Token);
            return process.ExitCode == 0 && File.Exists(path) ? await File.ReadAllBytesAsync(path, ct) : null;
        }
        catch (OperationCanceledException) when (!ct.IsCancellationRequested)
        {
            return null;
        }
        finally
        {
            if (!process.HasExited)
            {
                process.Kill();
                await process.WaitForExitAsync();
            }
            File.Delete(path);
        }
    }
}
