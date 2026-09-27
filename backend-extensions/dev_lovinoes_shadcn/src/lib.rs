use shared::{State, extensions::Extension};

/// This extension is frontend-only: everything it does lives in `frontend/src`.
/// The backend half exists because the extension format requires it.
#[derive(Default)]
pub struct ExtensionStruct;

#[async_trait::async_trait]
impl Extension for ExtensionStruct {
    async fn initialize(&mut self, _state: State) {
        tracing::info!("dev_lovinoes_shadcn (shadcn/ui theme) initialized");
    }
}
