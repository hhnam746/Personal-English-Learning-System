using System.Text.RegularExpressions;

namespace VoP.Service.Common;

public static class Rules
{
    public static string Normalize(string text) => Regex.Replace(text.Normalize(System.Text.NormalizationForm.FormKC).Trim().ToLowerInvariant().Replace('’', '\''),
         @"\s+",
         " ").TrimEnd('.',
         '!',
         '?',
         ',',
         ';',
         ':');
    public static void Require(bool condition, string message, int status = 400)
    {
        if (!condition) throw new ApiException(status, message);
    }
    public static void Paging(int page, int size) => Require(page > 0 && page <= 100000 && size is >= 1 and <= 100,
         "page must be 1..100000 and pageSize 1..100.");
}
