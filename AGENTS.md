<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep role sign-in presentation in the shared SignInLayout and scoped semantic entrance tokens; this coordinates branding without coupling authentication handlers.
- Render nested sign-in routes through an Outlet wrapper on /auth; this keeps the teacher entrance independent of the student form and its session redirect.
