declare namespace Chat {

	interface Chat {
		timestamp: number;
		createTime: string
		text: string
		ast:string;
		inversion?: boolean
		error?: boolean
		loading?: boolean
		conversationOptions?: ConversationRequest | null
		requestOptions: { prompt: string; options?: ConversationRequest | null }
	}
	interface ChatInfo{
		data: Chat[],
		id: number|string,
		timestamp:number;
		tem?: string
		title: string
		isEdit: boolean
	}
	interface ChatState {
		active: number | string | null
		chat: ChatInfo[],
		searchMsg:string,
		localChat: ChatInfo[],
	}

	interface ConversationRequest {
		conversationId?: string
		parentMessageId?: string
	}

	interface ConversationResponse {
		conversationId: string
		detail: {
			choices: { finish_reason: string; index: number; logprobs: any; text: string }[]
			created: number
			id: string
			model: string
			object: string
			usage: { completion_tokens: number; prompt_tokens: number; total_tokens: number }
		}
		id: string
		parentMessageId: string
		role: string
		text: string
	}

	interface paper {
		answerIndex: number
		options: string[]
		title: string
	}
}
