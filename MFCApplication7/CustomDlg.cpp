// CustomDlg.cpp: 구현 파일
//

#include "pch.h"
#include "framework.h"
#include "MFCApplication7.h"
#include "CustomDlg.h"
#include "afxdialogex.h"
#include <afx.h>

#include <urlmon.h>

#include <string>
#include <tchar.h>
#include <iomanip>
#include <fstream>
#include <sstream>
#include <codecvt>
#include <stdlib.h>
#include <wrl.h>
#include <wil/com.h>
#include "WebView2.h"



using namespace Microsoft::WRL;


// Pointer to WebViewController
static wil::com_ptr<ICoreWebView2Controller> webviewController;

// Pointer to WebView window
static wil::com_ptr<ICoreWebView2> webview;

// non-member function (util)
std::string escapeBackticks(const std::string& str) {
	std::string escapedStr;
	for (char ch : str) {
		if (ch == '`') {
			escapedStr += "\\`";  // 백틱을 이스케이프 처리
		}
		else {
			escapedStr += ch;
		}
	}
	return escapedStr;
}

std::wstring getJsFileContent(const LPCWSTR filePath) {
	std::wifstream wif(filePath);
	wif.imbue(std::locale(std::locale::empty(), new std::codecvt_utf8<wchar_t>));
	std::wstringstream wss;


	if (wif) {
		wss << wif.rdbuf();
		return wss.str();
	} else {
		return L"";
	}
}

std::wstring getJsScriptForAddToHTMLBody(const std::wstring& str) {
	return L"const newScript = document.createElement('script');\n"
		L"newScript.innerHTML = `" + str + L"`;\n"
		L"document.body.insertBefore(newScript, document.body.firstChild);";
}


// ONLY_FOR_TEST_GLOBAL_VALUE
int waitTime = 90;
int progressRate = 0;
int aheadCount = 100;
int behindCount = 200;


// CustomDlg 대화 상자

IMPLEMENT_DYNAMIC(CustomDlg, CDialogEx)


CustomDlg::CustomDlg(CWnd* pParent /*=nullptr*/)
	: CDialogEx(IDD_DIALOG1, pParent), m_pParent(pParent)
{
}

CustomDlg::~CustomDlg()
{
}

void CustomDlg::DoDataExchange(CDataExchange* pDX)
{
	CDialogEx::DoDataExchange(pDX);
}


BEGIN_MESSAGE_MAP(CustomDlg, CDialogEx)
	ON_BN_CLICKED(IDC_BUTTON1, &CustomDlg::OnBnClickedButton1)
END_MESSAGE_MAP()


// CustomDlg 메시지 처리기




BOOL CustomDlg::OnInitDialog()
{
	CDialogEx::OnInitDialog();

	// TODO:  여기에 추가 초기화 작업을 추가합니다.

	AfxMessageBox(_T("WebView OnInitDialog Called"));
	InitializeWebView();

	return TRUE;  // return TRUE unless you set the focus to a control
				  // 예외: OCX 속성 페이지는 FALSE를 반환해야 합니다.
}


void CustomDlg::InitializeWebView()
{
	AfxMessageBox(_T("WebView InitializeWebView Called"));
	HWND hWnd = this->GetSafeHwnd();
	CreateCoreWebView2EnvironmentWithOptions(nullptr, nullptr, nullptr,
		Callback<ICoreWebView2CreateCoreWebView2EnvironmentCompletedHandler>(
			[hWnd, this](HRESULT result, ICoreWebView2Environment* env) -> HRESULT {
		// Create a CoreWebView2Controller and get the associated CoreWebView2 whose parent is the main window hWnd
		env->CreateCoreWebView2Controller(hWnd, Callback<ICoreWebView2CreateCoreWebView2ControllerCompletedHandler>(
			[hWnd, this](HRESULT result, ICoreWebView2Controller* controller) -> HRESULT {
			if (controller != nullptr) {
				webviewController = controller;
				webviewController->get_CoreWebView2(&webview);
			}

			// Add a few settings for the webview
			// The demo step is redundant since the values are the default settings
			wil::com_ptr<ICoreWebView2Settings> settings;
			webview->get_Settings(&settings);
			settings->put_IsScriptEnabled(TRUE);
			settings->put_AreDefaultScriptDialogsEnabled(TRUE);
			settings->put_IsWebMessageEnabled(TRUE);

			// Resize WebView to fit the bounds of the parent window
			RECT bounds;
			::GetClientRect(hWnd, &bounds);
			webviewController->put_Bounds(bounds);

			// Schedule an async task to navigate to Bing
			//wil::com_ptr<IUri> uri;
			//CreateUri(path.c_str(), Uri_CREATE_ALLOW_IMPLICIT_FILE_SCHEME, 0, &uri);
			//wil::unique_bstr uriBstr;
			//uri->GetAbsoluteUri(&uriBstr);

			//std::wstring path2 = std::wstring(uriBstr.get());
			LPCWSTR address = L"file:///C:/Users/STCLAB1/source/repos/MFCApplication7/MFCApplication7/HTMLPage.htm";
			AfxMessageBox(address);
			HRESULT navigateResult = webview->Navigate(address);


			// <NavigationEvents>
			// Step 4 - Navigation events
			EventRegistrationToken token;
			webview->add_NavigationStarting(Callback<ICoreWebView2NavigationStartingEventHandler>(
				[](ICoreWebView2* webview, ICoreWebView2NavigationStartingEventArgs* args) -> HRESULT {
				wil::unique_cotaskmem_string uri;
				args->get_Uri(&uri);

				// register an ICoreWebView2NavigationStartingEventHandler to cancel any non-https navigation
				//std::wstring source(uri.get());
				//if (source.substr(0, 5) != L"https") {
				//	args->put_Cancel(true);
				//}
				return S_OK;
			}).Get(), &token);
			// </NavigationEvents>

			// <Scripting>
			// Step 5 - Scripting
			// Schedule an async task to add initialization script that freezes the Object object
			webview->AddScriptToExecuteOnDocumentCreated(L"Object.freeze(Object);", nullptr);
			// Schedule an async task to get the document URL

			webview->ExecuteScript(L"window.document.URL;", Callback<ICoreWebView2ExecuteScriptCompletedHandler>(
				[](HRESULT errorCode, LPCWSTR resultObjectAsJson) -> HRESULT {
				LPCWSTR URL = resultObjectAsJson;
				//doSomethingWithURL(URL);
				return S_OK;
			}).Get());

			// CUSOTM CODE
			LPCWSTR jsFilePath = L"C:/Users/STCLAB1/source/repos/MFCApplication7/MFCApplication7/vwrTest.js";
			std::wstring jsFileContent = getJsFileContent(jsFilePath);
			std::wstring jsInitScript = getJsScriptForAddToHTMLBody(jsFileContent);
			webview->ExecuteScript(jsInitScript.c_str(),nullptr);
			// 초기화
			webview->ExecuteScript(L"setVWRMetrics('10:20', 15, 20, 30);" ,nullptr);

			// </Scripting>

			// <CommunicationHostWeb>
			// Step 6 - Communication between host and web content
			// Set an event handler for the host to return received message back to the web content
			webview->add_WebMessageReceived(Callback<ICoreWebView2WebMessageReceivedEventHandler>(
				[this](ICoreWebView2* webview, ICoreWebView2WebMessageReceivedEventArgs* args) -> HRESULT {
				wil::unique_cotaskmem_string message;
				HRESULT hr1 = args->TryGetWebMessageAsString(&message);
				// processMessage(&message);
				HRESULT hr2 = webview->PostWebMessageAsString(message.get());

				std::wstring messageText(message.get());
				if (messageText == L"NF-VWR-CANCEL") {
					CDialogEx::EndDialog(IDOK);
				}
				return S_OK;
			}).Get(), &token);

			// Schedule an async task to add initialization script that
			// 1) Add an listener to print message from the host
			// 2) Post document URL to the host
			webview->AddScriptToExecuteOnDocumentCreated(
				L"window.chrome.webview.addEventListener(\'message\', event => alert(event.data));" \
				L"window.chrome.webview.postMessage(window.document.URL);",
				nullptr);
			// </CommunicationHostWeb>

			return S_OK;
		}).Get());
		return S_OK;
	}).Get());
}

std::wstring secToTime(const int &sec) {
	int min = sec / 60;
	int remain = sec % 60;
	std::wstringstream wss;
	wss << std::setw(2) << std::setfill(L'0') << min << L":"
		<< std::setw(2) << std::setfill(L'0') << remain;

	return wss.str();
}

// resource 버튼
void CustomDlg::OnBnClickedButton1()
{

	webview->ExecuteScript(L"console.log('Click Called');" , nullptr);

	waitTime -= 1;
	progressRate += 1;
	aheadCount -= 10;
	behindCount += 10;
	std::wstringstream wss;
	wss << L"setVWRMetrics("  
		<< L"\"" << secToTime(waitTime) << L"\","
		<< progressRate << ","
		<< aheadCount << ","
		<< behindCount 
	<< ");";
	std::wstring command = L"console.log(`" + wss.str() + L"`);";
	webview->ExecuteScript(command.c_str(), nullptr);
	webview->ExecuteScript(wss.str().c_str(), nullptr);

	// TODO: 여기에 컨트롤 알림 처리기 코드를 추가합니다.
}
